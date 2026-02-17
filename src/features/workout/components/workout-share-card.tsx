"use client";

import { useState } from "react";
import { Workout } from "@/types/workout";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration, formatVolume, calculateWorkoutStats } from "@/lib/workout-utils";
import { Dumbbell, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WorkoutShareCardProps {
    workout: Workout;
    photoUrl?: string;
}

export function WorkoutShareCard({ workout, photoUrl }: WorkoutShareCardProps) {
    const stats = calculateWorkoutStats(workout);

    return (
        <Card
            id="workout-share-card"
            className="w-full max-w-md mx-auto overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2"
        >
            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">FitVerse AI</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Photo */}
                {photoUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <img
                            src={photoUrl}
                            alt="Workout photo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        className="bg-background/50 backdrop-blur rounded-lg p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{formatDuration(stats.duration)}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                    </motion.div>

                    <motion.div
                        className="bg-background/50 backdrop-blur rounded-lg p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{formatVolume(stats.totalVolume)}</p>
                        <p className="text-xs text-muted-foreground">Total Volume</p>
                    </motion.div>

                    <motion.div
                        className="bg-background/50 backdrop-blur rounded-lg p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Dumbbell className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{workout.exercises.length}</p>
                        <p className="text-xs text-muted-foreground">Exercises</p>
                    </motion.div>

                    <motion.div
                        className="bg-background/50 backdrop-blur rounded-lg p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <CheckCircle className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stats.completedSets}</p>
                        <p className="text-xs text-muted-foreground">Sets Completed</p>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="text-center pt-2 border-t">
                    <p className="text-sm font-semibold text-primary">
                        💪 Workout Complete!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
