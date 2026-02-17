"use client";

import { WorkoutTemplate } from "@/types/workout-template";
import { WORKOUT_TEMPLATES } from "@/data/workout-templates";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Target, TrendingUp, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface TemplateSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectTemplate: (template: WorkoutTemplate) => void;
}

export function TemplateSelectionDialog({
    open,
    onOpenChange,
    onSelectTemplate
}: TemplateSelectionDialogProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted';
        }
    };

    const handleSelectTemplate = (template: WorkoutTemplate) => {
        onSelectTemplate(template);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        Choose a Workout Template
                    </DialogTitle>
                    <DialogDescription>
                        Select a pre-built workout template to get started quickly
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[600px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {WORKOUT_TEMPLATES.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <Badge
                                                variant="outline"
                                                className={getDifficultyColor(template.difficulty)}
                                            >
                                                {template.difficulty}
                                            </Badge>
                                        </div>
                                        <CardDescription>{template.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{template.durationMinutes} min</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>{template.exercises.length} exercises</span>
                                            </div>
                                        </div>

                                        {/* Target Muscles */}
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                <Target className="h-4 w-4" />
                                                Target Muscles
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {template.targetMuscles.map((muscle) => (
                                                    <Badge key={muscle} variant="secondary" className="text-xs">
                                                        {muscle}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Exercise List Preview */}
                                        <div>
                                            <div className="text-sm font-medium mb-2">Exercises</div>
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                {template.exercises.slice(0, 3).map((ex, idx) => (
                                                    <div key={idx}>
                                                        • {ex.name} - {ex.sets}×{ex.reps}
                                                    </div>
                                                ))}
                                                {template.exercises.length > 3 && (
                                                    <div className="text-xs text-muted-foreground italic">
                                                        +{template.exercises.length - 3} more...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Start Button */}
                                        <Button
                                            className="w-full"
                                            onClick={() => handleSelectTemplate(template)}
                                        >
                                            Start Template
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
