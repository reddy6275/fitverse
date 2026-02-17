"use client";

import { WorkoutMuscleAnalysis } from "@/types/exercise-library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Clock, AlertCircle, Scale } from "lucide-react";
import { motion } from "framer-motion";

interface MuscleActivationDisplayProps {
    analysis: WorkoutMuscleAnalysis;
}

export function MuscleActivationDisplay({ analysis }: MuscleActivationDisplayProps) {
    const getIntensityBadgeVariant = (level: 'Low' | 'Moderate' | 'High') => {
        switch (level) {
            case 'Low': return 'default';
            case 'Moderate': return 'secondary';
            case 'High': return 'destructive';
        }
    };

    const getStressBadgeVariant = (level: string) => {
        switch (level) {
            case 'Minimal':
            case 'Light':
                return 'default';
            case 'Moderate':
            case 'High':
                return 'secondary';
            case 'Intense':
            case 'Extreme':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-4">
            {/* Overall Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Muscle Activation Analysis
                        </CardTitle>
                        <Badge variant={getIntensityBadgeVariant(analysis.overallIntensity)}>
                            {analysis.overallIntensity} Intensity
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Recovery: {analysis.estimatedRecoveryHours}h ({analysis.estimatedRecoveryDays} day{analysis.estimatedRecoveryDays > 1 ? 's' : ''})</span>
                    </div>

                    {/* Push/Pull Imbalance Warning */}
                    {analysis.muscleImbalance && (
                        <div className={`flex items-start gap-2 text-sm p-3 rounded-lg border ${analysis.muscleImbalance.isBalanced
                                ? 'bg-green-500/10 border-green-500/20'
                                : 'bg-yellow-500/10 border-yellow-500/20'
                            }`}>
                            <Scale className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="font-medium mb-1">
                                    Push/Pull Balance
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Push: {analysis.muscleImbalance.pushActivation}% | Pull: {analysis.muscleImbalance.pullActivation}% | Ratio: {analysis.muscleImbalance.ratio}
                                </div>
                                <div className="text-xs">
                                    {analysis.muscleImbalance.recommendation}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Muscle Breakdown */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Muscles Worked</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {analysis.totalMuscles.map((muscle, index) => (
                        <motion.div
                            key={muscle.muscleName}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{muscle.muscleName}</span>
                                    <Badge
                                        variant={getStressBadgeVariant(muscle.stressLevel)}
                                        className="text-xs"
                                    >
                                        {muscle.stressLevel}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {muscle.recoveryHours}h recovery
                                    </span>
                                </div>
                                <span className="font-semibold text-primary">
                                    {muscle.finalPercentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${muscle.finalPercentage}%` }}
                                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                                    style={{ backgroundColor: muscle.color }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {muscle.recoverySuggestion}
                            </p>
                        </motion.div>
                    ))}

                    {analysis.totalMuscles.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No muscle activation data available. Make sure to complete sets during your workout.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
