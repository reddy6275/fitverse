// Exercise Library Types
export interface MuscleActivation {
    name: string;
    baseActivation: number;
}

export interface ExerciseDefinition {
    id: string;
    name: string;
    category: string;
    equipment: string;
    type: 'compound' | 'isolation';
    intensityMultiplier: number;
    maxCap: number;
    muscles: MuscleActivation[];
}

// Stress level classification
export type StressLevel = 'Minimal' | 'Light' | 'Moderate' | 'High' | 'Intense' | 'Extreme';

// Muscle Activation Results
export interface MuscleActivationResult {
    muscleName: string;
    finalPercentage: number;
    intensityLevel: 'Low' | 'Moderate' | 'High';
    stressLevel: StressLevel;
    color: string; // Hex color code for heatmap visualization
    recoveryHours: number; // Recovery time in hours
    recoverySuggestion: string;
}

// Push/Pull muscle imbalance analysis
export interface MuscleImbalance {
    pushActivation: number;
    pullActivation: number;
    ratio: number; // push/pull ratio
    isBalanced: boolean;
    recommendation: string;
}

export interface WorkoutMuscleAnalysis {
    totalMuscles: MuscleActivationResult[];
    overallIntensity: 'Low' | 'Moderate' | 'High';
    estimatedRecoveryDays: number;
    estimatedRecoveryHours: number; // Recovery in hours for precision
    muscleImbalance?: MuscleImbalance; // Push/pull balance analysis
}

// User Profile Extension
export interface UserProfile {
    bodyWeight: number; // in kg
    // ... other profile fields
}
