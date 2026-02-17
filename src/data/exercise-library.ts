import { ExerciseDefinition } from "@/types/exercise-library";

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
    {
        id: "bench_press",
        name: "Barbell Bench Press",
        category: "Chest",
        equipment: "Barbell",
        type: "compound",
        intensityMultiplier: 0.4,
        maxCap: 85,
        muscles: [
            { name: "Pectoralis Major", baseActivation: 60 },
            { name: "Triceps", baseActivation: 25 },
            { name: "Anterior Deltoid", baseActivation: 15 }
        ]
    },
    {
        id: "squat",
        name: "Barbell Squat",
        category: "Legs",
        equipment: "Barbell",
        type: "compound",
        intensityMultiplier: 0.45,
        maxCap: 90,
        muscles: [
            { name: "Quadriceps", baseActivation: 40 },
            { name: "Glutes", baseActivation: 35 },
            { name: "Hamstrings", baseActivation: 15 },
            { name: "Core", baseActivation: 10 }
        ]
    },
    {
        id: "pullup",
        name: "Pull Up",
        category: "Back",
        equipment: "Bodyweight",
        type: "compound",
        intensityMultiplier: 0.35,
        maxCap: 85,
        muscles: [
            { name: "Latissimus Dorsi", baseActivation: 50 },
            { name: "Biceps", baseActivation: 30 },
            { name: "Mid Back", baseActivation: 20 }
        ]
    },
    {
        id: "deadlift",
        name: "Barbell Deadlift",
        category: "Back",
        equipment: "Barbell",
        type: "compound",
        intensityMultiplier: 0.5,
        maxCap: 95,
        muscles: [
            { name: "Hamstrings", baseActivation: 35 },
            { name: "Glutes", baseActivation: 30 },
            { name: "Lower Back", baseActivation: 20 },
            { name: "Core", baseActivation: 15 }
        ]
    },
    {
        id: "pushup",
        name: "Push Up",
        category: "Chest",
        equipment: "Bodyweight",
        type: "compound",
        intensityMultiplier: 0.3,
        maxCap: 75,
        muscles: [
            { name: "Pectoralis Major", baseActivation: 55 },
            { name: "Triceps", baseActivation: 30 },
            { name: "Anterior Deltoid", baseActivation: 15 }
        ]
    }
];

// Helper function to get exercise definition by ID
export function getExerciseDefinition(exerciseId: string): ExerciseDefinition | undefined {
    return EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
}

// Helper function to get exercise definition by name (fuzzy match)
export function getExerciseDefinitionByName(exerciseName: string): ExerciseDefinition | undefined {
    const normalized = exerciseName.toLowerCase().trim();
    return EXERCISE_LIBRARY.find(ex =>
        ex.name.toLowerCase().includes(normalized) ||
        normalized.includes(ex.name.toLowerCase())
    );
}
