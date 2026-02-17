"use client";

import { useState } from "react";
import { WorkoutExercise } from "@/types/workout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { Plus, Trash2, ChevronDown, Check, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkoutExerciseCardProps {
    exercise: WorkoutExercise;
    exerciseIndex: number;
    updateSet: (exerciseIndex: number, setIndex: number, field: string, value: any) => void;
    addSet: (exerciseIndex: number) => void;
    removeSet: (exerciseIndex: number, setIndex: number) => void;
}

export function WorkoutExerciseCard({
    exercise,
    exerciseIndex,
    updateSet,
    addSet,
    removeSet
}: WorkoutExerciseCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const setVariants = {
        hidden: { opacity: 0, x: -10, height: 0 },
        visible: { opacity: 1, x: 0, height: "auto", transition: { duration: 0.2 } },
        exit: { opacity: 0, x: 10, height: 0, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
        >
            <Card className="overflow-hidden border-l-4 border-l-primary/50">
                <CardHeader
                    className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                        <Badge variant="outline" className="text-xs font-normal ml-2">
                            {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}
                        </Badge>
                    </div>
                </CardHeader>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <CardContent className="px-2 pb-4 pt-0">
                                {/* Header Row */}
                                <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-muted-foreground mb-2 text-center px-2">
                                    <div className="col-span-1">Set</div>
                                    <div className="col-span-3">kg</div>
                                    <div className="col-span-3">Reps</div>
                                    <div className="col-span-2">Done</div>
                                    <div className="col-span-1"></div>
                                </div>

                                <div className="space-y-1">
                                    <AnimatePresence mode="popLayout">
                                        {exercise.sets.map((set, setIndex) => (
                                            <motion.div
                                                key={set.id}
                                                layout
                                                variants={setVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className={cn(
                                                    "grid grid-cols-10 gap-2 items-center text-center p-2 rounded-md transition-colors",
                                                    set.completed ? "bg-green-500/10" : "hover:bg-muted/30"
                                                )}
                                            >
                                                <div className="col-span-1 flex items-center justify-center">
                                                    <span className="text-xs text-muted-foreground font-mono bg-muted rounded-full w-5 h-5 flex items-center justify-center">
                                                        {setIndex + 1}
                                                    </span>
                                                </div>

                                                <div className="col-span-3">
                                                    <NumberInput
                                                        value={set.weight}
                                                        onChange={(val) => updateSet(exerciseIndex, setIndex, 'weight', val)}
                                                        unit="kg"
                                                        placeholder="-"
                                                        className={cn("h-8 bg-transparent", set.completed && "text-muted-foreground")}
                                                        allowDecimals={true}
                                                    />
                                                </div>

                                                <div className="col-span-3">
                                                    <NumberInput
                                                        value={set.reps}
                                                        onChange={(val) => updateSet(exerciseIndex, setIndex, 'reps', val)}
                                                        placeholder="-"
                                                        className={cn("h-8 bg-transparent", set.completed && "text-muted-foreground")}
                                                    />
                                                </div>

                                                <div className="col-span-2 flex justify-center">
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        onClick={() => {
                                                            // Trigger visual feedback then update
                                                            updateSet(exerciseIndex, setIndex, 'completed', !set.completed);
                                                        }}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                                            set.completed
                                                                ? "bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                                                                : "border-muted-foreground/30 text-transparent hover:border-primary/50"
                                                        )}
                                                    >
                                                        <Check className={cn("h-4 w-4", set.completed ? "opacity-100" : "opacity-0")} />
                                                    </motion.button>
                                                </div>

                                                <div className="col-span-1 flex justify-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeSet(exerciseIndex, setIndex)}
                                                        disabled={exercise.sets.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 px-2"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed border-muted-foreground/50 hover:border-primary/50 hover:bg-accent"
                                        onClick={() => addSet(exerciseIndex)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Set
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
