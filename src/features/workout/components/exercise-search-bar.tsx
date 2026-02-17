"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { Exercise } from "@/types/workout";
import { EXERCISE_DB } from "@/data/exercise-db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ExerciseSearchBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { addExerciseToWorkout } = useWorkoutStore();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredExercises = EXERCISE_DB.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.includes(search.toLowerCase())
    );

    const handleAdd = (exercise: Exercise) => {
        addExerciseToWorkout(exercise);
        // Optional: keep open to add more or close
        // setIsOpen(false); 
        // Let's keep it open but maybe clear search if we want? 
        // For now, keeping it simple.
    };

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scaleY: 0.95,
            transformOrigin: "top"
        },
        visible: {
            opacity: 1,
            y: 0,
            scaleY: 1,
            transition: {
                duration: 0.2,
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            scaleY: 0.95,
            transition: { duration: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div ref={wrapperRef} className="relative w-full z-50">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search exercises to add..."
                    className="pl-9 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/50"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <AnimatePresence>
                    {search && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                                setSearch("");
                                setIsOpen(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg overflow-hidden max-h-[300px]"
                    >
                        <div className="overflow-y-auto max-h-[300px] p-2 flex flex-col gap-1">
                            {filteredExercises.length > 0 ? (
                                filteredExercises.map((exercise) => (
                                    <motion.div
                                        key={exercise.id}
                                        variants={itemVariants}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group transition-colors"
                                        onClick={() => handleAdd(exercise)}
                                        whileHover={{ x: 4 }}
                                        layout
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{exercise.name}</span>
                                            <div className="flex gap-2">
                                                <span className="text-xs text-muted-foreground capitalize">{exercise.muscleGroup}</span>
                                                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                                    • {exercise.equipment}
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 text-center text-sm text-muted-foreground"
                                >
                                    No exercises found.
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
