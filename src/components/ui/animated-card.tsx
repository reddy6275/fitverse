"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { triggerHaptic } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface AnimatedCardProps extends React.ComponentProps<"div"> {
    enableHaptic?: boolean;
    glassmorphism?: boolean;
    hoverEffect?: "lift" | "glow" | "both" | "none";
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
    ({ className, children, enableHaptic = true, glassmorphism = false, hoverEffect = "both", onClick, ...props }, ref) => {
        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (enableHaptic) {
                triggerHaptic("medium");
            }
            onClick?.(e);
        };

        const shouldAnimate = hoverEffect !== "none";

        return (
            <motion.div
                initial={{ scale: 1, y: 0 }}
                whileHover={shouldAnimate ? { scale: 1.02, y: -4 } : undefined}
                whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.2 }}
                className="relative"
            >
                <Card
                    ref={ref}
                    className={cn(
                        "transition-all duration-300",
                        shouldAnimate && (hoverEffect === "lift" || hoverEffect === "both") && "hover:shadow-xl hover:shadow-primary/10",
                        glassmorphism && "backdrop-blur-xl bg-background/80 border-white/20",
                        className
                    )}
                    onClick={handleClick}
                    {...props}
                >
                    {children}
                </Card>
                {shouldAnimate && (hoverEffect === "glow" || hoverEffect === "both") && (
                    <motion.div
                        className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl opacity-0"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.5 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </motion.div>
        );
    }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
