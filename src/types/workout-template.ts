export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TemplateExercise {
    name: string;
    sets: number;
    reps: number;
    restSeconds?: number;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: DifficultyLevel;
    durationMinutes: number;
    targetMuscles: string[];
    exercises: TemplateExercise[];
}
