"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    animation?: "pulse" | "wave";
}

export function LoadingSkeleton({
    className,
    variant = "rectangular",
    animation = "wave"
}: LoadingSkeletonProps) {
    const baseClasses = "bg-muted";

    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full aspect-square",
        rectangular: "rounded-md"
    };

    if (animation === "wave") {
        return (
            <motion.div
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    "relative overflow-hidden",
                    className
                )}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                        x: ["-100%", "100%"]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn(
                baseClasses,
                variantClasses[variant],
                className
            )}
            animate={{
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <LoadingSkeleton variant="rectangular" className="h-32 w-full" />
            <LoadingSkeleton variant="text" className="w-3/4" />
            <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <LoadingSkeleton variant="circular" className="w-12 h-12" />
                    <div className="flex-1 space-y-2">
                        <LoadingSkeleton variant="text" className="w-3/4" />
                        <LoadingSkeleton variant="text" className="w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
