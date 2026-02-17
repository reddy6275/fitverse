export type MuscleGroup =
    | "chest"
    | "back"
    | "legs"
    | "shoulders"
    | "arms"
    | "core"
    | "full_body"
    | "cardio";

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    equipment?: string;
    videoUrl?: string; // Optional for now
}

export interface WorkoutSet {
    id: string;
    reps: number;
    weight: number;
    rpe?: number; // Rate of Perceived Exertion (1-10)
    completed: boolean;
}

export interface WorkoutExercise {
    exerciseId: string;
    name: string;
    sets: WorkoutSet[];
}

export interface Workout {
    id: string;
    userId: string;
    name: string;
    date: Date;
    duration: number; // in seconds
    exercises: WorkoutExercise[];
    notes?: string;
    photoUrl?: string;
    totalVolume?: number;
    calories?: number;
    intensityScore?: number;
    personalRecords?: WorkoutExercise[];
    muscleActivation?: any; // WorkoutMuscleAnalysis - using any to avoid circular dependency
}

export interface WorkoutStats {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    completedSets: number;
    duration: number;
}

