import { Workout, WorkoutExercise } from "@/types/workout";
import { ExerciseDefinition, MuscleActivationResult, WorkoutMuscleAnalysis, StressLevel, MuscleImbalance } from "@/types/exercise-library";
import { getExerciseDefinitionByName } from "@/data/exercise-library";

// Define push and pull muscle groups for imbalance detection
const PUSH_MUSCLES = ['Pectoralis Major', 'Anterior Deltoid', 'Triceps', 'Quadriceps'];
const PULL_MUSCLES = ['Latissimus Dorsi', 'Mid Back', 'Biceps', 'Hamstrings', 'Lower Back'];

/**
 * Calculate volume boost based on sets × reps × weight
 */
function calculateVolumeBoost(sets: number, reps: number, weight: number): number {
    const totalVolume = sets * reps * weight;
    // Logarithmic scaling to prevent extreme values
    const volumeBoost = Math.log10(1 + totalVolume / 1000) * 10;
    return Math.min(volumeBoost, 50); // Cap at 50% boost
}

/**
 * Calculate muscle activation for a single exercise set with volume boost
 * Formula: adjustedActivation = baseActivation × (1 + (weightUsed / userBodyWeight) × intensityMultiplier + volumeBoost)
 */
function calculateSetActivation(
    baseActivation: number,
    weightUsed: number,
    userBodyWeight: number,
    intensityMultiplier: number,
    reps: number,
    maxCap: number
): number {
    // Weight-based adjustment
    const weightFactor = (weightUsed / userBodyWeight) * intensityMultiplier;

    // Volume boost (reps contribute to volume)
    const volumeBoost = Math.log10(1 + (reps * weightUsed) / 100) * 5;

    const adjustedActivation = baseActivation * (1 + weightFactor + volumeBoost / 100);
    return Math.min(adjustedActivation, maxCap);
}

/**
 * Get color code based on activation percentage
 */
function getActivationColor(percentage: number): string {
    if (percentage <= 20) return '#86efac'; // Light Green - Minimal
    if (percentage <= 40) return '#4ade80'; // Green - Light
    if (percentage <= 60) return '#fbbf24'; // Yellow - Moderate
    if (percentage <= 80) return '#fb923c'; // Orange - High
    return '#ef4444'; // Red - Intense
}

/**
 * Determine stress level based on activation percentage
 */
function getStressLevel(percentage: number): StressLevel {
    if (percentage <= 15) return 'Minimal';
    if (percentage <= 35) return 'Light';
    if (percentage <= 55) return 'Moderate';
    if (percentage <= 75) return 'High';
    if (percentage <= 90) return 'Intense';
    return 'Extreme';
}

/**
 * Calculate recovery hours based on activation and stress level
 */
function calculateRecoveryHours(percentage: number, stressLevel: StressLevel): number {
    const baseHours: Record<StressLevel, number> = {
        'Minimal': 12,
        'Light': 24,
        'Moderate': 36,
        'High': 48,
        'Intense': 60,
        'Extreme': 72
    };

    // Fine-tune based on exact percentage
    const base = baseHours[stressLevel];
    const adjustment = (percentage % 20) * 0.5; // Add up to 10 hours based on position in range

    return Math.round(base + adjustment);
}

/**
 * Determine intensity level based on activation percentage
 */
function getIntensityLevel(percentage: number): 'Low' | 'Moderate' | 'High' {
    if (percentage < 40) return 'Low';
    if (percentage <= 70) return 'Moderate';
    return 'High';
}

/**
 * Generate recovery suggestion based on muscle and activation level
 */
function getRecoverySuggestion(muscleName: string, activation: number, recoveryHours: number): string {
    const stressLevel = getStressLevel(activation);

    const suggestions: Record<StressLevel, string> = {
        'Minimal': `Light work on ${muscleName}. Recovery: ${recoveryHours}h. Can train again soon.`,
        'Light': `Moderate ${muscleName} activation. Recovery: ${recoveryHours}h. Rest 1 day before training.`,
        'Moderate': `Good workout for ${muscleName}. Recovery: ${recoveryHours}h. Rest 1-2 days.`,
        'High': `Strong ${muscleName} activation. Recovery: ${recoveryHours}h. Allow 2 days rest.`,
        'Intense': `Intense ${muscleName} work! Recovery: ${recoveryHours}h. Rest 2-3 days.`,
        'Extreme': `Extreme ${muscleName} stress! Recovery: ${recoveryHours}h. Full 3 day recovery needed.`
    };

    return suggestions[stressLevel];
}

/**
 * Detect push/pull muscle imbalance
 */
function detectMuscleImbalance(muscles: MuscleActivationResult[]): MuscleImbalance | undefined {
    // Calculate total activation for push muscles
    const pushActivation = muscles
        .filter(m => PUSH_MUSCLES.includes(m.muscleName))
        .reduce((sum, m) => sum + m.finalPercentage, 0);

    // Calculate total activation for pull muscles
    const pullActivation = muscles
        .filter(m => PULL_MUSCLES.includes(m.muscleName))
        .reduce((sum, m) => sum + m.finalPercentage, 0);

    // Only analyze if both push and pull muscles were worked
    if (pushActivation === 0 || pullActivation === 0) {
        return undefined;
    }

    const ratio = pushActivation / pullActivation;
    const isBalanced = ratio >= 0.8 && ratio <= 1.2;

    let recommendation: string;
    if (isBalanced) {
        recommendation = '✅ Balanced push/pull workout. Great muscle symmetry!';
    } else if (ratio > 1.2) {
        const difference = Math.round((ratio - 1) * 100);
        recommendation = `⚠️ Push-dominant workout (+${difference}%). Add more pulling exercises (rows, pull-ups, deadlifts) next session.`;
    } else {
        const difference = Math.round((1 - ratio) * 100);
        recommendation = `⚠️ Pull-dominant workout (+${difference}%). Add more pushing exercises (bench press, push-ups, squats) next session.`;
    }

    return {
        pushActivation: Math.round(pushActivation * 10) / 10,
        pullActivation: Math.round(pullActivation * 10) / 10,
        ratio: Math.round(ratio * 100) / 100,
        isBalanced,
        recommendation
    };
}

/**
 * Calculate total muscle activation for an entire workout
 */
export function calculateMuscleActivation(
    workout: Workout,
    userBodyWeight: number = 70 // Default body weight if not provided
): WorkoutMuscleAnalysis {
    // Map to store total activation per muscle
    const muscleActivationMap = new Map<string, number>();
    const muscleSetsCount = new Map<string, number>(); // Track sets per muscle for volume boost

    // Process each exercise in the workout
    workout.exercises.forEach((exercise) => {
        // Get exercise definition from library
        const exerciseDef = getExerciseDefinitionByName(exercise.name);

        if (!exerciseDef) {
            console.warn(`Exercise "${exercise.name}" not found in library`);
            return;
        }

        // Count completed sets for this exercise
        const completedSets = exercise.sets.filter(s => s.completed);

        // Calculate activation for each completed set
        completedSets.forEach((set) => {
            // Calculate activation for each muscle in this exercise
            exerciseDef.muscles.forEach((muscle) => {
                const setActivation = calculateSetActivation(
                    muscle.baseActivation,
                    set.weight,
                    userBodyWeight,
                    exerciseDef.intensityMultiplier,
                    set.reps,
                    exerciseDef.maxCap
                );

                // Add to total muscle activation
                const currentActivation = muscleActivationMap.get(muscle.name) || 0;
                const newActivation = Math.min(currentActivation + setActivation, 100); // Cap at 100%
                muscleActivationMap.set(muscle.name, newActivation);

                // Track set count for volume calculations
                const currentSets = muscleSetsCount.get(muscle.name) || 0;
                muscleSetsCount.set(muscle.name, currentSets + 1);
            });
        });
    });

    // Convert map to results array with all enhanced features
    const totalMuscles: MuscleActivationResult[] = Array.from(muscleActivationMap.entries())
        .map(([muscleName, finalPercentage]) => {
            const stressLevel = getStressLevel(finalPercentage);
            const recoveryHours = calculateRecoveryHours(finalPercentage, stressLevel);

            return {
                muscleName,
                finalPercentage: Math.round(finalPercentage * 10) / 10, // Round to 1 decimal
                intensityLevel: getIntensityLevel(finalPercentage),
                stressLevel,
                color: getActivationColor(finalPercentage),
                recoveryHours,
                recoverySuggestion: getRecoverySuggestion(muscleName, finalPercentage, recoveryHours)
            };
        })
        .sort((a, b) => b.finalPercentage - a.finalPercentage); // Sort by activation descending

    // Calculate overall workout intensity
    const avgActivation = totalMuscles.length > 0
        ? totalMuscles.reduce((sum, m) => sum + m.finalPercentage, 0) / totalMuscles.length
        : 0;

    const overallIntensity = getIntensityLevel(avgActivation);
    const estimatedRecoveryDays = getEstimatedRecoveryDays(overallIntensity, totalMuscles);
    const estimatedRecoveryHours = Math.max(...totalMuscles.map(m => m.recoveryHours), 24);

    // Detect muscle imbalance
    const muscleImbalance = detectMuscleImbalance(totalMuscles);

    return {
        totalMuscles,
        overallIntensity,
        estimatedRecoveryDays,
        estimatedRecoveryHours,
        muscleImbalance
    };
}

/**
 * Estimate recovery days based on overall intensity and muscle groups worked
 */
function getEstimatedRecoveryDays(
    overallIntensity: 'Low' | 'Moderate' | 'High',
    muscles: MuscleActivationResult[]
): number {
    const highIntensityMuscles = muscles.filter(m => m.intensityLevel === 'High').length;

    if (overallIntensity === 'High' || highIntensityMuscles >= 3) {
        return 3;
    } else if (overallIntensity === 'Moderate' || highIntensityMuscles >= 1) {
        return 2;
    }
    return 1;
}

/**
 * Export muscle activation data as clean JSON
 */
export function exportMuscleActivationJSON(analysis: WorkoutMuscleAnalysis): string {
    return JSON.stringify(analysis, null, 2);
}

/**
 * Get muscle activation summary text
 */
export function getMuscleActivationSummary(analysis: WorkoutMuscleAnalysis): string {
    const topMuscles = analysis.totalMuscles.slice(0, 3);
    const muscleList = topMuscles.map(m => `${m.muscleName} (${m.finalPercentage}%)`).join(', ');

    return `${analysis.overallIntensity} intensity workout. Top muscles: ${muscleList}. Recovery: ${analysis.estimatedRecoveryHours}h (${analysis.estimatedRecoveryDays} days).`;
}

