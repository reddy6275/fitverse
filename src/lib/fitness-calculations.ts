import { UserProfile, ActivityLevel, FitnessGoal, ACTIVITY_MULTIPLIERS } from '@/types/user-profile';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * Male: BMR = 10×weight + 6.25×height − 5×age + 5
 * Female: BMR = 10×weight + 6.25×height − 5×age − 161
 */
export function calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female'
): number {
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Calculate maintenance calories (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateMaintenanceCalories(
    bmr: number,
    activityLevel: ActivityLevel
): number {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate target calories based on fitness goal
 * Fat Loss: Maintenance - 400
 * Muscle Gain: Maintenance + 300
 * Maintenance: Maintenance
 */
export function calculateTargetCalories(
    maintenanceCalories: number,
    fitnessGoal: FitnessGoal
): number {
    switch (fitnessGoal) {
        case 'fat_loss':
            return maintenanceCalories - 400;
        case 'muscle_gain':
            return maintenanceCalories + 300;
        case 'maintenance':
            return maintenanceCalories;
    }
}

/**
 * Calculate protein target
 * 2.2g per kg bodyweight
 */
export function calculateProteinTarget(weight: number): number {
    return Math.round(weight * 2.2);
}

/**
 * Calculate fat target
 * 25% of total calories (9 calories per gram)
 */
export function calculateFatTarget(targetCalories: number): number {
    return Math.round((targetCalories * 0.25) / 9);
}

/**
 * Calculate carbs target
 * Remaining calories after protein and fats (4 calories per gram)
 */
export function calculateCarbsTarget(
    targetCalories: number,
    proteinGrams: number,
    fatGrams: number
): number {
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    return Math.round(remainingCalories / 4);
}

/**
 * Calculate all nutrition targets for a user profile
 */
export function calculateNutritionTargets(profile: Partial<UserProfile>): {
    bmr: number;
    maintenanceCalories: number;
    targetCalories: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
} | null {
    // Validate required fields
    if (
        !profile.weight ||
        !profile.height ||
        !profile.age ||
        !profile.gender ||
        !profile.activityLevel ||
        !profile.fitnessGoal
    ) {
        return null;
    }

    const bmr = calculateBMR(
        profile.weight,
        profile.height,
        profile.age,
        profile.gender
    );

    const maintenanceCalories = calculateMaintenanceCalories(
        bmr,
        profile.activityLevel
    );

    const targetCalories = calculateTargetCalories(
        maintenanceCalories,
        profile.fitnessGoal
    );

    const proteinTarget = calculateProteinTarget(profile.weight);
    const fatsTarget = calculateFatTarget(targetCalories);
    const carbsTarget = calculateCarbsTarget(
        targetCalories,
        proteinTarget,
        fatsTarget
    );

    return {
        bmr: Math.round(bmr),
        maintenanceCalories,
        targetCalories,
        proteinTarget,
        carbsTarget,
        fatsTarget,
    };
}

/**
 * Check if user profile is complete for calculations
 */
export function isProfileComplete(profile: Partial<UserProfile>): boolean {
    return !!(
        profile.weight &&
        profile.height &&
        profile.age &&
        profile.gender &&
        profile.activityLevel &&
        profile.fitnessGoal
    );
}

/**
 * Get missing profile fields
 */
export function getMissingProfileFields(profile: Partial<UserProfile>): string[] {
    const missing: string[] = [];

    if (!profile.weight) missing.push('weight');
    if (!profile.height) missing.push('height');
    if (!profile.age) missing.push('age');
    if (!profile.gender) missing.push('gender');
    if (!profile.activityLevel) missing.push('activity level');
    if (!profile.fitnessGoal) missing.push('fitness goal');

    return missing;
}
