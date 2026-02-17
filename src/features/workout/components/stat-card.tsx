"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: number;
    suffix?: string;
    icon: React.ElementType;
    delay?: number;
    className?: string;
}

export function StatCard({ label, value, suffix = "", icon: Icon, delay = 0, className }: StatCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });
    const [displayValue, setDisplayValue] = useState(0);

    // Motion value for the number
    const motionValue = useMotionValue(0);

    // Spring animation for smooth counting
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    useEffect(() => {
        if (inView) {
            // Add a small delay before starting the count
            const timeout = setTimeout(() => {
                motionValue.set(value);
            }, delay * 1000);
            return () => clearTimeout(timeout);
        }
    }, [inView, value, motionValue, delay]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
        return () => unsubscribe();
    }, [springValue]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: delay }}
            className={cn("bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm", className)}
        >
            <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">
                        {displayValue.toLocaleString()}
                    </span>
                    {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                </div>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
            </div>
        </motion.div>
    );
}
