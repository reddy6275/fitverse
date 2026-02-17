"use client";

import { useState, useRef, useEffect } from "react";
import { Workout } from "@/types/workout";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Share2,
    Download,
    X,
    Trophy,
    Activity,
    Dumbbell,
    Timer,
    Repeat,
    Flame,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "@/components/ui/confetti";
import { StatCard } from "./stat-card";
import { MuscleActivationDisplay } from "./muscle-activation-display";
import { WorkoutShareCard } from "./workout-share-card"; // Reusing for generation
import { calculateWorkoutStats, formatDuration, formatVolume, shareToSocial } from "@/lib/workout-utils";
import { calculateMuscleActivation } from "@/lib/muscle-activation";
import html2canvas from "html2canvas";

interface WorkoutCompletionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workout: Workout | null;
    onSave: () => void;
}

export function WorkoutCompletionModal({ open, onOpenChange, workout, onSave }: WorkoutCompletionModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    // Trigger confetti when opened
    useEffect(() => {
        if (open) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [open]);

    if (!workout) return null;

    const stats = calculateWorkoutStats(workout);
    const muscleAnalysis = calculateMuscleActivation(workout);

    // Scores based on real data now
    const scores = {
        strength: Math.min(100, Math.floor(stats.totalVolume / 100)), // Still heuristic-based
        hypertrophy: Math.min(100, stats.totalSets * 5),
        fatigue: workout.intensityScore || 0
    };

    const handleDownload = async () => {
        if (!shareCardRef.current) return;
        try {
            const canvas = await html2canvas(shareCardRef.current, {
                useCORS: true,
                scale: 2, // Retuina quality
                backgroundColor: "#09090b" // Dark background
            });

            const link = document.createElement('a');
            link.download = `workout-${workout.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) onSave(); // Auto-save on close if clicked outside
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-full h-full sm:h-[90vh] sm:max-w-4xl p-0 gap-0 overflow-hidden bg-background border-none sm:border sm:rounded-xl">
                {showConfetti && <Confetti />}

                <div className="flex flex-col h-full relative">
                    {/* Header */}
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur" onClick={onSave}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 h-full">
                        <div className="p-6 sm:p-10 flex flex-col gap-8 max-w-3xl mx-auto">

                            {/* Hero Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center space-y-2 mt-8 sm:mt-0"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                    className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4"
                                >
                                    <Trophy className="h-10 w-10 text-yellow-500" />
                                </motion.div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Workout Complete!</h1>
                                <p className="text-muted-foreground text-lg">{workout.name}</p>
                            </motion.div>

                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    label="Volume"
                                    value={stats.totalVolume}
                                    suffix="kg"
                                    icon={Dumbbell}
                                    delay={0.3}
                                />
                                <StatCard
                                    label="Duration"
                                    value={Math.floor(stats.duration / 60)}
                                    suffix="min"
                                    icon={Timer}
                                    delay={0.4}
                                />
                                <StatCard
                                    label="Sets"
                                    value={stats.totalSets}
                                    icon={Repeat}
                                    delay={0.5}
                                />
                                <StatCard
                                    label="Reps"
                                    value={stats.totalReps}
                                    icon={Activity}
                                    delay={0.6}
                                />
                            </div>

                            {/* Secondary Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    label="Calories"
                                    value={workout.calories || 0}
                                    suffix="kcal"
                                    icon={Flame}
                                    delay={0.7}
                                    className="bg-orange-500/10 border-orange-500/20"
                                />
                                <StatCard
                                    label="Intensity"
                                    value={workout.intensityScore || 0}
                                    suffix="%"
                                    icon={Activity}
                                    delay={0.8}
                                    className="bg-red-500/10 border-red-500/20"
                                />
                            </div>

                            {/* Personal Records Section */}
                            {workout.personalRecords && workout.personalRecords.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
                                >
                                    <h3 className="text-yellow-500 font-semibold mb-2 flex items-center gap-2">
                                        <Trophy className="h-4 w-4" /> New Personal Records!
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {workout.personalRecords.map((ex, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span>{ex.name}</span>
                                                <span className="font-bold text-yellow-500">New PR</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Muscle Heatmap Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-muted/30 rounded-2xl p-6 border"
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    Muscle Activation
                                </h3>
                                <div className="h-[300px] w-full">
                                    <MuscleActivationDisplay analysis={muscleAnalysis} />
                                </div>
                            </motion.div>

                            {/* Share Actions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                            >
                                <Button size="lg" className="w-full sm:w-auto" onClick={onSave} variant="default">
                                    <Check className="mr-2 h-4 w-4" /> Save & Close
                                </Button>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" /> Save Image
                                </Button>
                                <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => shareToSocial('twitter', workout)}>
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </Button>
                            </motion.div>


                            {/* Hidden Share Card for Image Generation */}
                            <div className="absolute left-[9999px]">
                                <div ref={shareCardRef}>
                                    <WorkoutShareCard workout={workout} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
