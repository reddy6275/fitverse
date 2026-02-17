"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkoutCompletionModal } from "./workout-completion-modal";
import { Workout } from "@/types/workout";
import { ExerciseSearchBar } from "./exercise-search-bar";
import { WorkoutExerciseCard } from "./workout-exercise-card";
import { motion, AnimatePresence } from "framer-motion";


export function ActiveWorkout() {
    const {
        activeWorkout,
        workoutTimer,
        isTimerRunning,
        startTimer,
        pauseTimer,
        tickTimer,
        finishWorkout,
        addSet,
        removeSet,
        updateSet,
        cancelWorkout
    } = useWorkoutStore();

    const [showSummary, setShowSummary] = useState(false);
    const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                tickTimer();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, tickTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinishClick = async () => {
        setIsFinishing(true);
        setError(null);

        try {
            console.log("[UI] Finish button clicked");
            const workout = await finishWorkout();

            if (workout) {
                console.log("[UI] ✅ Workout completed, showing summary");
                setCompletedWorkout(workout);
                setShowSummary(true);
            } else {
                throw new Error("Workout completion returned null");
            }
        } catch (err) {
            console.error("[UI] ❌ Finish workout failed:", err);
            const message = err instanceof Error ? err.message : "Failed to finish workout";
            setError(message);
            // TODO: Replace with toast notification
            alert(`Error: ${message}`);
        } finally {
            setIsFinishing(false);
        }
    };

    const handleSaveSummary = async () => {
        setShowSummary(false);
        setCompletedWorkout(null);
    };

    if (!activeWorkout) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p className="text-muted-foreground">Select exercises to start your workout.</p>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-6 pb-20"
            >
                <div className="flex flex-col sticky top-0 bg-background/95 backdrop-blur z-10 border-b transition-all duration-300">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-lg">{activeWorkout.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTime(workoutTimer)}
                                {!isTimerRunning && workoutTimer > 0 && (
                                    <Badge variant="secondary" className="text-xs animate-pulse">PAUSED</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={isTimerRunning ? pauseTimer : startTimer}
                                title={isTimerRunning ? "Pause timer" : "Resume timer"}
                            >
                                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={cancelWorkout}>Discard</Button>
                            <Button
                                size="sm"
                                onClick={handleFinishClick}
                                disabled={isFinishing}
                            >
                                {isFinishing ? "Saving..." : "Finish"}
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <div className="px-2 pb-2">
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
                                {error}
                            </div>
                        </div>
                    )}
                    {/* Integrated Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="py-2"
                    >
                        <ExerciseSearchBar />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {activeWorkout.exercises.map((exercise, exerciseIndex) => (
                            <WorkoutExerciseCard
                                key={exercise.exerciseId}
                                exercise={exercise}
                                exerciseIndex={exerciseIndex}
                                updateSet={updateSet}
                                addSet={addSet}
                                removeSet={removeSet}
                            />
                        ))}
                    </AnimatePresence>
                    {activeWorkout.exercises.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 text-muted-foreground"
                        >
                            No exercises yet. Search above to add one!
                        </motion.div>
                    )}
                </div>
            </motion.div >

            {/* Workout Completion Modal */}
            < WorkoutCompletionModal
                open={showSummary}
                onOpenChange={setShowSummary}
                workout={completedWorkout}
                onSave={handleSaveSummary}
            />
        </>
    );
}
