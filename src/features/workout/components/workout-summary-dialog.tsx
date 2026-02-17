"use client";

import { useState, useRef } from "react";
import { Workout } from "@/types/workout";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutShareCard } from "./workout-share-card";
import { MuscleActivationDisplay } from "./muscle-activation-display";
import { shareToSocial, calculateWorkoutStats, formatDuration, formatVolume } from "@/lib/workout-utils";
import { Camera, Upload, Share2, Copy, Check, Twitter, Facebook, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import imageCompression from "browser-image-compression";

interface WorkoutSummaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workout: Workout | null;
    onSave: (photo?: string) => void;
}

export function WorkoutSummaryDialog({ open, onOpenChange, workout, onSave }: WorkoutSummaryDialogProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!workout) return null;

    const stats = calculateWorkoutStats(workout);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Error uploading photo:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleShare = async (platform: 'twitter' | 'facebook' | 'native' | 'copy') => {
        if (platform === 'copy') {
            // Generate image and copy
            const cardElement = document.getElementById('workout-share-card');
            if (cardElement) {
                try {
                    const canvas = await html2canvas(cardElement);
                    canvas.toBlob(async (blob: Blob | null) => {
                        if (blob) {
                            await navigator.clipboard.write([
                                new ClipboardItem({ 'image/png': blob })
                            ]);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }
                    });
                } catch (error) {
                    console.error("Error copying image:", error);
                }
            }
        } else {
            await shareToSocial(platform, workout);
        }
    };

    const handleSave = () => {
        onSave(photoUrl || undefined);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">🎉 Workout Complete!</DialogTitle>
                    <DialogDescription>
                        Great job! Here's your workout summary.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Tabs for Stats and Muscle Activation */}
                    <Tabs defaultValue="stats" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="stats">Workout Stats</TabsTrigger>
                            <TabsTrigger value="muscles">
                                <Activity className="h-4 w-4 mr-2" />
                                Muscle Activation
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="stats" className="space-y-6">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{formatDuration(stats.duration)}</p>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{formatVolume(stats.totalVolume)}</p>
                                    <p className="text-sm text-muted-foreground">Total Volume</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{workout.exercises.length}</p>
                                    <p className="text-sm text-muted-foreground">Exercises</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{stats.completedSets}</p>
                                    <p className="text-sm text-muted-foreground">Sets</p>
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <Label>Add a Photo (Optional)</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isUploading ? "Uploading..." : "Upload Photo"}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>
                                {photoUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary"
                                    >
                                        <img src={photoUrl} alt="Workout" className="w-full h-full object-cover" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Shareable Card Preview */}
                            <div className="space-y-2">
                                <Label>Share Your Achievement</Label>
                                <WorkoutShareCard workout={workout} photoUrl={photoUrl || undefined} />
                            </div>
                        </TabsContent>

                        <TabsContent value="muscles" className="space-y-4">
                            {workout.muscleActivation ? (
                                <MuscleActivationDisplay analysis={workout.muscleActivation} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No muscle activation data available</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleShare('twitter')}
                            className="gap-2"
                        >
                            <Twitter className="h-4 w-4" />
                            Twitter
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleShare('facebook')}
                            className="gap-2"
                        >
                            <Facebook className="h-4 w-4" />
                            Facebook
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleShare('native')}
                            className="gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleShare('copy')}
                            className="gap-2"
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </AnimatePresence>
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Workout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
