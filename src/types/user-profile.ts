// User Profile Types
export interface UserProfile {
    userId: string;
    weight: number; // kg
    height: number; // cm
    age: number;
    gender: 'male' | 'female';
    fitnessGoal: 'fat_loss' | 'muscle_gain' | 'maintenance';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    gymDaysPerWeek: number;

    // Calculated targets
    calorieTarget?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatsTarget?: number;
    bmr?: number;
    maintenanceCalories?: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
        calculationsPerformed?: string[];
        dataExtracted?: Partial<UserProfile>;
    };
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'maintenance';
export type Gender = 'male' | 'female';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Light (exercise 1-3 days/week)',
    moderate: 'Moderate (exercise 3-5 days/week)',
    active: 'Active (exercise 6-7 days/week)',
    very_active: 'Very Active (intense exercise daily)',
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
    fat_loss: 'Fat Loss',
    muscle_gain: 'Muscle Gain',
    maintenance: 'Maintenance',
};
