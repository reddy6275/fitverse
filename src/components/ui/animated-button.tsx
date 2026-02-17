"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface AnimatedButtonProps extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    enableHaptic?: boolean;
    glowColor?: string;
    asChild?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    ({ className, children, enableHaptic = true, glowColor, onClick, ...props }, ref) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (enableHaptic) {
                triggerHaptic("light");
            }
            onClick?.(e);
        };

        return (
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative inline-block"
            >
                <Button
                    ref={ref}
                    className={cn(
                        "relative overflow-hidden transition-all duration-300",
                        "hover:font-semibold",
                        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
                        "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
                        glowColor && `hover:shadow-lg hover:shadow-${glowColor}/50`,
                        className
                    )}
                    onClick={handleClick}
                    {...props}
                >
                    <span className="relative z-10 transition-all duration-200 hover:tracking-wide">
                        {children}
                    </span>
                </Button>
                {glowColor && (
                    <motion.div
                        className={cn(
                            "absolute inset-0 -z-10 rounded-md blur-xl opacity-0",
                            `bg-${glowColor}`
                        )}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.6 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </motion.div>
        );
    }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
