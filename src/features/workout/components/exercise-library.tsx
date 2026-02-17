"use client";

import { useState } from "react";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { Exercise, MuscleGroup } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";

// Mock Data for now
const EXERCISE_DB: Exercise[] = [
    { id: "1", name: "Bench Press", muscleGroup: "chest", equipment: "baebell" },
    { id: "2", name: "Push Up", muscleGroup: "chest", equipment: "bodyweight" },
    { id: "3", name: "Squat", muscleGroup: "legs", equipment: "barbell" },
    { id: "4", name: "Deadlift", muscleGroup: "back", equipment: "barbell" },
    { id: "5", name: "Pull Up", muscleGroup: "back", equipment: "bodyweight" },
    { id: "6", name: "Dumbbell Curl", muscleGroup: "arms", equipment: "dumbbell" },
    { id: "7", name: "Shoulder Press", muscleGroup: "shoulders", equipment: "dumbbell" },
    { id: "8", name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
];

export function ExerciseLibrary() {
    const [search, setSearch] = useState("");
    const { addExerciseToWorkout } = useWorkoutStore();

    const filteredExercises = EXERCISE_DB.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search exercises..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="flex flex-col gap-2">
                    {filteredExercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50">
                            <div className="flex flex-col">
                                <span className="font-medium">{exercise.name}</span>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs uppercase">{exercise.muscleGroup}</Badge>
                                    {exercise.equipment && (
                                        <span className="text-xs text-muted-foreground capitalize">{exercise.equipment}</span>
                                    )}
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => addExerciseToWorkout(exercise)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {filteredExercises.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No exercises found.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
