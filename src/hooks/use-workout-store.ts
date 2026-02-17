import { create } from "zustand";
import { Workout, WorkoutExercise, Exercise } from "@/types/workout";
import { WorkoutTemplate } from "@/types/workout-template";
import { calculateMuscleActivation } from "@/lib/muscle-activation";
import { calculateCaloriesBurned, calculateIntensityScore } from "@/lib/workout-utils";
import { saveWorkout, updateUserStats, checkPersonalRecords } from "@/features/workout/services/workout-service";

interface WorkoutState {
    activeWorkout: Workout | null;
    workoutTimer: number; // in seconds
    isTimerRunning: boolean;
    workoutPhoto: string | null;

    startWorkout: (userId: string) => void;
    startWorkoutFromTemplate: (userId: string, template: WorkoutTemplate) => void;
    addExerciseToWorkout: (exercise: Exercise) => void;
    updateSet: (exerciseIndex: number, setIndex: number, field: string, value: any) => void;
    addSet: (exerciseIndex: number) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
    finishWorkout: (photo?: string) => Promise<Workout | null>;
    cancelWorkout: () => void;
    setWorkoutPhoto: (photo: string | null) => void;

    // Timer actions
    startTimer: () => void;
    pauseTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    tickTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    activeWorkout: null,
    workoutTimer: 0,
    isTimerRunning: false,
    workoutPhoto: null,

    startWorkout: (userId: string) => {
        set({
            activeWorkout: {
                id: crypto.randomUUID(),
                userId,
                name: `Workout - ${new Date().toLocaleDateString()}`,
                date: new Date(),
                duration: 0,
                exercises: [],
            },
            workoutTimer: 0,
            isTimerRunning: true,
        });
    },

    startWorkoutFromTemplate: (userId: string, template: WorkoutTemplate) => {
        // Create exercises from template
        const exercises: WorkoutExercise[] = template.exercises.map(templateEx => ({
            exerciseId: crypto.randomUUID(),
            name: templateEx.name,
            sets: Array.from({ length: templateEx.sets }, () => ({
                id: crypto.randomUUID(),
                reps: templateEx.reps,
                weight: 0, // User will fill in weight
                completed: false
            }))
        }));

        set({
            activeWorkout: {
                id: crypto.randomUUID(),
                userId,
                name: template.name,
                date: new Date(),
                duration: 0,
                exercises,
            },
            workoutTimer: 0,
            isTimerRunning: true,
        });
    },

    addExerciseToWorkout: (exercise: Exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newExercise: WorkoutExercise = {
            exerciseId: exercise.id,
            name: exercise.name,
            sets: [
                { id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }
            ]
        };

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: [...activeWorkout.exercises, newExercise],
            }
        });
    },

    updateSet: (exerciseIndex, setIndex, field, value) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const exercises = [...activeWorkout.exercises];
        const exercise = exercises[exerciseIndex];
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], [field]: value };

        set({ activeWorkout: { ...activeWorkout, exercises } });
    },

    addSet: (exerciseIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const exercises = [...activeWorkout.exercises];
        const previousSet = exercises[exerciseIndex].sets[exercises[exerciseIndex].sets.length - 1];

        exercises[exerciseIndex].sets.push({
            id: crypto.randomUUID(),
            reps: previousSet ? previousSet.reps : 0,
            weight: previousSet ? previousSet.weight : 0,
            completed: false
        });

        set({ activeWorkout: { ...activeWorkout, exercises } });
    },

    removeSet: (exerciseIndex, setIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const exercises = [...activeWorkout.exercises];
        const updatedSets = exercises[exerciseIndex].sets.filter((_, idx) => idx !== setIndex);

        // Only update if there's at least one set remaining
        if (updatedSets.length > 0) {
            exercises[exerciseIndex] = {
                ...exercises[exerciseIndex],
                sets: updatedSets
            };
            set({ activeWorkout: { ...activeWorkout, exercises } });
        }
    },

    finishWorkout: async (photo?: string) => {
        const { activeWorkout, workoutTimer, workoutPhoto } = get();

        console.log("[finishWorkout] Starting workout completion...");

        // Validation: Check if workout exists
        if (!activeWorkout) {
            const error = "No active workout to finish";
            console.error("[finishWorkout] ❌", error);
            throw new Error(error);
        }

        console.log("[finishWorkout] Workout data:", {
            id: activeWorkout.id,
            userId: activeWorkout.userId,
            name: activeWorkout.name,
            exercises: activeWorkout.exercises.length,
            timer: workoutTimer
        });

        // Validation: Check for exercises
        if (activeWorkout.exercises.length === 0) {
            const error = "Cannot finish workout with no exercises";
            console.error("[finishWorkout] ❌", error);
            throw new Error(error);
        }

        // Validation: Check for at least one completed set
        const hasCompletedSets = activeWorkout.exercises.some(ex =>
            ex.sets.some(set => set.completed)
        );
        if (!hasCompletedSets) {
            const error = "Please complete at least one set before finishing";
            console.error("[finishWorkout] ❌", error);
            throw new Error(error);
        }

        console.log("[finishWorkout] ✅ Validation passed");

        // Calculate total volume
        let totalVolume = 0;
        activeWorkout.exercises.forEach((exercise) => {
            exercise.sets.forEach((set) => {
                if (set.completed) {
                    totalVolume += set.weight * set.reps;
                }
            });
        });
        console.log("[finishWorkout] Total volume calculated:", totalVolume, "kg");

        // Calculate muscle activation
        // TODO: Get user body weight from user profile
        const userBodyWeight = 70; // Default 70kg, should come from user profile
        console.log("[finishWorkout] Calculating muscle activation...");
        const muscleActivation = calculateMuscleActivation(activeWorkout, userBodyWeight);

        const calories = calculateCaloriesBurned({ ...activeWorkout, duration: workoutTimer }, userBodyWeight);
        const intensityScore = calculateIntensityScore({ ...activeWorkout, duration: workoutTimer, totalVolume });
        console.log("[finishWorkout] Metrics calculated - Calories:", calories, "Intensity:", intensityScore);

        // Create completed workout with all data
        const completedWorkout: Workout = {
            ...activeWorkout,
            duration: workoutTimer,
            totalVolume,
            calories,
            intensityScore,
            photoUrl: photo || workoutPhoto || undefined,
            muscleActivation,
        };

        try {
            console.log("[finishWorkout] Checking for personal records...");
            const newPRs = await checkPersonalRecords(activeWorkout.userId, completedWorkout);
            if (newPRs.length > 0) {
                completedWorkout.personalRecords = newPRs;
                console.log("[finishWorkout] 🏆 New PRs detected:", newPRs.length);
            } else {
                console.log("[finishWorkout] No new PRs");
            }

            console.log("[finishWorkout] Saving workout and updating stats...");
            await Promise.all([
                saveWorkout(activeWorkout.userId, completedWorkout),
                updateUserStats(activeWorkout.userId, completedWorkout)
            ]);

            console.log("[finishWorkout] ✅ Workout saved successfully!");
        } catch (error) {
            console.error("[finishWorkout] ❌ Failed to save workout:", error);
            // Re-throw to surface to UI layer
            throw error;
        }

        // Log muscle activation JSON for debugging
        console.log('[finishWorkout] Muscle Activation Analysis:', JSON.stringify(muscleActivation, null, 2));

        // Reset state
        console.log("[finishWorkout] Resetting workout state...");
        set({
            activeWorkout: null,
            isTimerRunning: false,
            workoutTimer: 0,
            workoutPhoto: null
        });

        console.log("[finishWorkout] ✅ Workout completion flow finished successfully");
        return completedWorkout;
    },

    cancelWorkout: () => {
        set({
            activeWorkout: null,
            isTimerRunning: false,
            workoutTimer: 0,
            workoutPhoto: null
        });
    },

    setWorkoutPhoto: (photo: string | null) => set({ workoutPhoto: photo }),

    startTimer: () => set({ isTimerRunning: true }),
    pauseTimer: () => set({ isTimerRunning: false }),
    stopTimer: () => set({ isTimerRunning: false }),
    resetTimer: () => set({ workoutTimer: 0 }),
    tickTimer: () => set((state) => ({ workoutTimer: state.workoutTimer + 1 })),
}));
