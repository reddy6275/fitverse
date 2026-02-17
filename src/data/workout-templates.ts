import { WorkoutTemplate } from "@/types/workout-template";

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    {
        id: "push-day",
        name: "Push Day",
        description: "Chest + Shoulders + Triceps",
        difficulty: "Intermediate",
        durationMinutes: 60,
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        exercises: [
            { name: "Barbell Bench Press", sets: 4, reps: 8 },
            { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
            { name: "Overhead Shoulder Press", sets: 4, reps: 8 },
            { name: "Lateral Raises", sets: 3, reps: 15 },
            { name: "Tricep Pushdowns", sets: 3, reps: 12 },
            { name: "Dips", sets: 3, reps: 10 }
        ]
    },
    {
        id: "pull-day",
        name: "Pull Day",
        description: "Back + Biceps",
        difficulty: "Intermediate",
        durationMinutes: 60,
        targetMuscles: ["Lats", "Mid Back", "Biceps"],
        exercises: [
            { name: "Pull Up", sets: 4, reps: 8 },
            { name: "Barbell Rows", sets: 4, reps: 8 },
            { name: "Lat Pulldown", sets: 3, reps: 12 },
            { name: "Face Pulls", sets: 3, reps: 15 },
            { name: "Barbell Curl", sets: 3, reps: 10 },
            { name: "Hammer Curl", sets: 3, reps: 12 }
        ]
    },
    {
        id: "leg-day",
        name: "Leg Day",
        description: "Glutes + Quads + Hamstrings",
        difficulty: "Intermediate",
        durationMinutes: 65,
        targetMuscles: ["Quads", "Glutes", "Hamstrings", "Calves"],
        exercises: [
            { name: "Barbell Squat", sets: 4, reps: 8 },
            { name: "Romanian Deadlift", sets: 4, reps: 8 },
            { name: "Leg Press", sets: 3, reps: 12 },
            { name: "Bulgarian Split Squat", sets: 3, reps: 10 },
            { name: "Leg Curl", sets: 3, reps: 12 },
            { name: "Calf Raises", sets: 4, reps: 15 }
        ]
    },
    {
        id: "upper-body-strength",
        name: "Upper Body Strength",
        description: "Full Upper Body Power",
        difficulty: "Advanced",
        durationMinutes: 70,
        targetMuscles: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
            { name: "Barbell Bench Press", sets: 5, reps: 5 },
            { name: "Pull Up", sets: 5, reps: 5 },
            { name: "Overhead Press", sets: 4, reps: 6 },
            { name: "Barbell Row", sets: 4, reps: 6 },
            { name: "Skull Crushers", sets: 3, reps: 10 },
            { name: "Barbell Curl", sets: 3, reps: 10 }
        ]
    },
    {
        id: "full-body-beginner",
        name: "Full Body Beginner",
        description: "Perfect for getting started",
        difficulty: "Beginner",
        durationMinutes: 45,
        targetMuscles: ["Full Body"],
        exercises: [
            { name: "Goblet Squats", sets: 3, reps: 12 },
            { name: "Push Up", sets: 3, reps: 10 },
            { name: "Lat Pulldown", sets: 3, reps: 12 },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: 12 },
            { name: "Plank", sets: 3, reps: 30 },
            { name: "Glute Bridge", sets: 3, reps: 15 }
        ]
    },
    {
        id: "fat-burn-hiit",
        name: "Fat Burn HIIT",
        description: "High-intensity full body workout",
        difficulty: "Intermediate",
        durationMinutes: 30,
        targetMuscles: ["Full Body", "Core"],
        exercises: [
            { name: "Burpees", sets: 3, reps: 15 },
            { name: "Mountain Climbers", sets: 3, reps: 30 },
            { name: "Kettlebell Swings", sets: 3, reps: 20 },
            { name: "Jump Squats", sets: 3, reps: 15 },
            { name: "Push Up", sets: 3, reps: 12 },
            { name: "Plank", sets: 3, reps: 45 }
        ]
    }
];

// Helper function to get template by ID
export function getTemplateById(templateId: string): WorkoutTemplate | undefined {
    return WORKOUT_TEMPLATES.find(t => t.id === templateId);
}
