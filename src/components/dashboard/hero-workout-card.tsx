import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Clock, Trophy, ChevronRight } from "lucide-react";
import { GlassPanel } from "./glass-panel";

interface HeroWorkoutCardProps {
    workoutName: string;
    duration: string;
    intensity: "Low" | "Medium" | "High";
    onStart: () => void;
}

export function HeroWorkoutCard({ workoutName, duration, intensity, onStart }: HeroWorkoutCardProps) {
    return (
        <GlassPanel
            variant="card"
            className="w-full relative overflow-hidden group border-primary/20"
            whileHover={{ scale: 1.01 }}
        >
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Today's Focus
                    </motion.div>

                    <motion.h2
                        className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {workoutName}
                    </motion.h2>

                    <motion.div
                        className="flex items-center gap-6 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            <span>{intensity} Intensity</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        size="lg"
                        className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                        onClick={onStart}
                    >
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Start Workout
                    </Button>
                </motion.div>
            </div>
        </GlassPanel>
    );
}
