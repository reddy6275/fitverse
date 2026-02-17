import { db } from "@/lib/firebase";
import { Workout, WorkoutExercise } from "@/types/workout";
import { doc, setDoc, updateDoc, increment, getDoc, serverTimestamp, writeBatch, collection, query, where, orderBy, getDocs } from "firebase/firestore";

/**
 * Save a completed workout to Firestore
 */
function cleanUndefined(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

export async function saveWorkout(userId: string, workout: Workout): Promise<void> {
    console.log("[saveWorkout] Starting save for user:", userId);
    console.log("[saveWorkout] Workout ID:", workout.id);
    console.log("[saveWorkout] Exercises count:", workout.exercises.length);

    try {
        const workoutRef = doc(db, `users/${userId}/workouts`, workout.id);

        // Deep sanitize workout object to remove undefined values
        const workoutData = cleanUndefined(workout);
        console.log("[saveWorkout] Data sanitized, saving to Firestore...");

        await setDoc(workoutRef, {
            ...workoutData,
            createdAt: serverTimestamp(),
        });

        console.log("[saveWorkout] ✅ Workout saved successfully:", workout.id);
    } catch (error) {
        console.error("[saveWorkout] ❌ Error saving workout:", error);
        console.error("[saveWorkout] Failed workout data:", { id: workout.id, userId, exerciseCount: workout.exercises.length });
        throw error; // Re-throw to surface error to caller
    }
}

/**
 * Update user's aggregate workout statistics
 */
export async function updateUserStats(userId: string, workout: Workout): Promise<void> {
    console.log("[updateUserStats] Updating stats for user:", userId);

    try {
        const statsRef = doc(db, `users/${userId}/stats`, "main");
        const statsSnapshot = await getDoc(statsRef);

        const newVolume = workout.totalVolume || 0;
        const newDuration = workout.duration || 0;

        if (statsSnapshot.exists()) {
            // Update existing stats
            await updateDoc(statsRef, {
                totalWorkouts: increment(1),
                totalVolume: increment(newVolume),
                totalTime: increment(newDuration),
                lastWorkoutDate: serverTimestamp(),
            });
            console.log("[updateUserStats] ✅ Stats updated successfully");
        } else {
            // Initialize stats if they don't exist
            await setDoc(statsRef, {
                totalWorkouts: 1,
                totalVolume: newVolume,
                totalTime: newDuration,
                lastWorkoutDate: serverTimestamp(),
            });
            console.log("[updateUserStats] ✅ Stats initialized successfully");
        }
    } catch (error) {
        console.error("[updateUserStats] ⚠️ Error updating user stats:", error);
        // Don't throw, as this is secondary to saving the workout
    }
}

/**
 * Check for new Personal Records (PRs) in the workout
 * Returns a list of exercises that achieved a PR
 */
export async function checkPersonalRecords(userId: string, workout: Workout): Promise<WorkoutExercise[]> {
    const prs: WorkoutExercise[] = [];
    const batch = writeBatch(db);
    let hasUpdates = false;

    // We need to check each exercise in the workout
    for (const exercise of workout.exercises) {
        // Calculate max weight for this exercise in current workout
        let maxWeight = 0;
        // Let's stick to Max Weight for simplicity as "PR" usually means 1RM or max weight for reps

        exercise.sets.forEach(set => {
            if (set.completed && set.weight > maxWeight) {
                maxWeight = set.weight;
            }
        });

        if (maxWeight === 0) continue;

        const prRef = doc(db, `users/${userId}/personal_records`, exercise.exerciseId);

        try {
            const prSnapshot = await getDoc(prRef);

            if (prSnapshot.exists()) {
                const currentPr = prSnapshot.data().weight || 0;
                if (maxWeight > currentPr) {
                    // New PR!
                    prs.push(exercise);
                    batch.update(prRef, {
                        weight: maxWeight,
                        date: serverTimestamp(),
                        workoutId: workout.id,
                        exerciseName: exercise.name // Store name for easier display
                    });
                    hasUpdates = true;
                }
            } else {
                // First time doing this exercise, valid "PR" technically, or just baseline
                // Let's count it as a PR if it's the first time logged
                prs.push(exercise);
                batch.set(prRef, {
                    weight: maxWeight,
                    date: serverTimestamp(),
                    workoutId: workout.id,
                    exerciseName: exercise.name
                });
                hasUpdates = true;
            }
        } catch (error) {
            console.error(`Error checking PR for ${exercise.name}:`, error);
        }
    }

    if (hasUpdates) {
        await batch.commit();
    }

    return prs;
}

/**
 * Calculate current streak based on workout history
 */
export async function getStreak(userId: string): Promise<number> {
    try {
        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            orderBy("date", "desc")
        );

        const snap = await getDocs(q);

        let streak = 0;
        let prev = new Date();

        // Check if the user has worked out today or yesterday to keep the streak alive
        // If the last workout was > 1 day ago (e.g. 2 days ago), streak should be 0? 
        // The user's logic handles this by comparing against 'prev' which starts as Now.

        for (const doc of snap.docs) {
            const data = doc.data();
            const d = data.date?.toDate ? data.date.toDate() : new Date(data.date);

            // Difference in days
            const diffTime = Math.abs(prev.getTime() - d.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays <= 1.5) { // Allow slightly flexible "1 day" (e.g. evening to next morning) or just strictly adherence? 
                // User sent `d` vs `prev`.
                // Check if it's not the SAME day (multiple workouts same day shouldn't inc streak twice?)
                // User's logic: streak++ if <= 1. 
                // If I workout twice today:
                // 1. Today 10am vs Now. Diff 0. Streak 1. Prev = 10am.
                // 2. Today 8am vs 10am. Diff 0. Streak 2. Prev = 8am.
                // This counts workouts, not days.
                // To count DAYS, we should check if day is different.

                // Let's stick closer to user's logic but ensure we don't double count days if that's the intent.
                // "Streak" usually means consecutive DAYS.
                // I will add a check to ignore same-day workouts for streak increment, 
                // but update `prev` so we can reach yesterday.

                const isSameDay = prev.getDate() === d.getDate() &&
                    prev.getMonth() === d.getMonth() &&
                    prev.getFullYear() === d.getFullYear();

                if (!isSameDay) {
                    streak++;
                }
                prev = d;
            } else {
                // Gap found, stop counting
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error("Error calculating streak:", error);
        return 0;
    }
}

/**
 * Calculate total active minutes from all workouts
 */
export async function getActiveMinutes(userId: string): Promise<number> {
    try {
        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId)
        );

        const snap = await getDocs(q);

        let totalSeconds = 0;

        snap.forEach(doc => {
            const data = doc.data();
            // Ensure we handle duration if it exists (assuming it's in seconds)
            if (data.duration) {
                totalSeconds += data.duration;
            }
        });

        // Return minutes
        return Math.floor(totalSeconds / 60);
    } catch (error) {
        console.error("Error calculating active minutes:", error);
        return 0;
    }
}

/**
 * Get workouts completed today
 */
export async function getWorkoutsToday(userId: string): Promise<number> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            where("date", ">=", today)
        );

        const snap = await getDocs(q);
        return snap.size;
    } catch (error) {
        console.error("Error getting workouts today:", error);
        return 0;
    }
}

/**
 * Get total number of workouts completed
 */
export async function getTotalWorkouts(userId: string): Promise<number> {
    try {
        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId)
        );

        const snap = await getDocs(q);
        return snap.size;
    } catch (error) {
        console.error("Error getting total workouts:", error);
        return 0;
    }
}

/**
 * Get workouts completed this week
 */
export async function getWorkoutsThisWeek(userId: string): Promise<number> {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            where("date", ">=", startOfWeek)
        );

        const snap = await getDocs(q);
        return snap.size;
    } catch (error) {
        console.error("Error getting workouts this week:", error);
        return 0;
    }
}

/**
 * Get active minutes today
 */
export async function getActiveMinutesToday(userId: string): Promise<number> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            where("date", ">=", today)
        );

        const snap = await getDocs(q);

        let totalSeconds = 0;
        snap.forEach(doc => {
            const data = doc.data();
            if (data.duration) {
                totalSeconds += data.duration;
            }
        });

        return Math.floor(totalSeconds / 60);
    } catch (error) {
        console.error("Error getting active minutes today:", error);
        return 0;
    }
}

/**
 * Get total calories burned from workouts
 */
export async function getTotalCalories(userId: string): Promise<number> {
    try {
        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId)
        );

        const snap = await getDocs(q);

        let totalCalories = 0;
        snap.forEach(doc => {
            const data = doc.data();
            // If workout has calories field, use it
            if (data.calories) {
                totalCalories += data.calories;
            } else if (data.duration) {
                // Estimate: ~5 calories per minute of workout (moderate intensity)
                totalCalories += Math.floor((data.duration / 60) * 5);
            }
        });

        return totalCalories;
    } catch (error) {
        console.error("Error getting total calories:", error);
        return 0;
    }
}

/**
 * Get calories burned today
 */
export async function getCaloriesToday(userId: string): Promise<number> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            where("date", ">=", today)
        );

        const snap = await getDocs(q);

        let totalCalories = 0;
        snap.forEach(doc => {
            const data = doc.data();
            // If workout has calories field, use it
            if (data.calories) {
                totalCalories += data.calories;
            } else if (data.duration) {
                // Estimate: ~5 calories per minute of workout (moderate intensity)
                totalCalories += Math.floor((data.duration / 60) * 5);
            }
        });

        return totalCalories;
    } catch (error) {
        console.error("Error getting calories today:", error);
        return 0;
    }
}

/**
 * Get recent workouts for display
 */
export async function getRecentWorkouts(userId: string, limit: number = 5): Promise<any[]> {
    try {
        const q = query(
            collection(db, `users/${userId}/workouts`),
            where("userId", "==", userId),
            orderBy("date", "desc")
        );

        const snap = await getDocs(q);
        const workouts = snap.docs.slice(0, limit).map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return workouts;
    } catch (error) {
        console.error("Error getting recent workouts:", error);
        return [];
    }
}
