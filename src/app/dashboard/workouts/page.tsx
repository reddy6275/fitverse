"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useWorkoutStore } from "@/hooks/use-workout-store";
import { WorkoutTemplate } from "@/types/workout-template";
import { ActiveWorkout } from "@/features/workout/components/active-workout";
import { TemplateSelectionDialog } from "@/features/workout/components/template-selection-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function WorkoutsPage() {
    const { user } = useAuth();
    const { activeWorkout, startWorkout, startWorkoutFromTemplate } = useWorkoutStore();
    const [showTemplates, setShowTemplates] = useState(false);

    const handleStartWorkout = () => {
        if (user?.uid) {
            startWorkout(user.uid);
        }
    };

    const handleSelectTemplate = (template: WorkoutTemplate) => {
        if (user?.uid) {
            startWorkoutFromTemplate(user.uid, template);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="h-full overflow-y-auto pr-2">
                {activeWorkout ? (
                    <ActiveWorkout />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <button
                            onClick={handleStartWorkout}
                            className="bg-primary/10 p-6 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            <Plus className="h-12 w-12 text-primary" />
                        </button>
                        <h2 className="text-2xl font-bold">Ready to workout?</h2>
                        <p className="text-muted-foreground">Start an empty workout or choose a template.</p>
                        <div className="flex gap-3">
                            <Button size="lg" onClick={handleStartWorkout}>
                                <Plus className="h-4 w-4 mr-2" />
                                Start Workout
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => setShowTemplates(true)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Use Template
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Selection Dialog */}
            <TemplateSelectionDialog
                open={showTemplates}
                onOpenChange={setShowTemplates}
                onSelectTemplate={handleSelectTemplate}
            />
        </div>
    );
}
