import { Workout, WorkoutStats } from "@/types/workout";

/**
 * Calculate total volume for a workout
 * Volume = sum of (weight × reps) for all completed sets
 */
export function calculateWorkoutVolume(workout: Workout): number {
    let totalVolume = 0;

    workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
            if (set.completed) {
                totalVolume += set.weight * set.reps;
            }
        });
    });

    return totalVolume;
}

/**
 * Calculate comprehensive workout statistics
 */
export function calculateWorkoutStats(workout: Workout): WorkoutStats {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let completedSets = 0;

    workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
            totalSets++;
            if (set.completed) {
                completedSets++;
                totalVolume += set.weight * set.reps;
                totalReps += set.reps;
            }
        });
    });

    return {
        totalVolume,
        totalSets,
        totalReps,
        completedSets,
        duration: workout.duration,
    };
}

/**
 * Format volume with thousand separators
 * @param volume - Volume in kg
 * @returns Formatted string (e.g., "2,400 kg")
 */
export function formatVolume(volume: number): string {
    return `${volume.toLocaleString()} kg`;
}

/**
 * Format duration in seconds to readable time
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "45:30" or "1:23:45")
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate shareable text for social media
 */
export function generateWorkoutShareText(workout: Workout): string {
    const stats = calculateWorkoutStats(workout);
    const volume = formatVolume(stats.totalVolume);
    const duration = formatDuration(stats.duration);

    return `💪 Just crushed a workout on FitVerse AI!

📊 Stats:
⏱️ Duration: ${duration}
🏋️ Total Volume: ${volume}
✅ ${stats.completedSets} sets completed
🔥 ${workout.exercises.length} exercises

#FitVerseAI #Fitness #WorkoutComplete`;
}

/**
 * Share workout to social media using Web Share API or fallback
 */
export async function shareToSocial(
    platform: 'twitter' | 'facebook' | 'instagram' | 'native' | 'copy',
    workout: Workout,
    imageUrl?: string
): Promise<void> {
    const shareText = generateWorkoutShareText(workout);
    const shareUrl = window.location.origin;

    if (platform === 'native' && navigator.share) {
        try {
            await navigator.share({
                title: 'My FitVerse Workout',
                text: shareText,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
        return;
    }

    if (platform === 'copy') {
        await navigator.clipboard.writeText(shareText);
        return;
    }

    // Platform-specific sharing
    const urls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        instagram: '', // Instagram doesn't support web sharing, would need mobile app
    };

    if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
    }
}

/**
 * Calculate estimated calories burned
 * Uses a simplified MET formula: Calories = MET * Weight(kg) * Time(hours)
 * Base MET for weight training is ~3.5-6.0 depending on intensity
 */
export function calculateCaloriesBurned(workout: Workout, bodyWeightKg: number = 70): number {
    const durationHours = workout.duration / 3600;
    const stats = calculateWorkoutStats(workout);

    // Estimate intensity based on volume density (kg per minute)
    const volumePerMinute = workout.duration > 0 ? stats.totalVolume / (workout.duration / 60) : 0;

    // Base MET for moderate weight training
    let met = 3.5;

    // Adjust MET based on volume density
    if (volumePerMinute > 1000) met = 6.0; // High intensity
    else if (volumePerMinute > 500) met = 5.0; // Moderate-High
    else if (volumePerMinute > 250) met = 4.0; // Moderate

    return Math.round(met * bodyWeightKg * durationHours);
}

/**
 * Calculate Workout Intensity Score (0-100)
 * Based on volume, duration, and sets density
 */
export function calculateIntensityScore(workout: Workout): number {
    const stats = calculateWorkoutStats(workout);
    if (stats.duration === 0) return 0;

    // 1. Volume Density: Volume per minute (Target: 500kg/min = 100pts)
    const volumeDensity = stats.totalVolume / (stats.duration / 60);
    const volumeScore = Math.min(100, (volumeDensity / 500) * 100);

    // 2. Set Density: Sets per hour (Target: 20 sets/hr = 100pts)
    const setsPerHour = stats.totalSets / (stats.duration / 3600);
    const setScore = Math.min(100, (setsPerHour / 20) * 100);

    // 3. Duration Score: (Target: 45-90 wins = optimal)
    // 60 mins = 100pts
    const durationMins = stats.duration / 60;
    let durationScore = 0;
    if (durationMins > 0) {
        durationScore = Math.min(100, (durationMins / 60) * 100);
    }

    // Weighted Average: 50% Volume, 30% Sets, 20% Duration
    return Math.round((volumeScore * 0.5) + (setScore * 0.3) + (durationScore * 0.2));
}
