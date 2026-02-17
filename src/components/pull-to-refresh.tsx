"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    const threshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) {
            const currentY = e.touches[0].clientY;
            const distance = Math.max(0, currentY - startY);
            setPullDistance(Math.min(distance, threshold * 1.5));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
        setPullDistance(0);
    };

    useEffect(() => {
        const element = document.body;
        element.addEventListener("touchstart", handleTouchStart);
        element.addEventListener("touchmove", handleTouchMove);
        element.addEventListener("touchend", handleTouchEnd);

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchmove", handleTouchMove);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [pullDistance, isRefreshing, startY]);

    return (
        <div className="relative">
            <AnimatePresence>
                {(pullDistance > 0 || isRefreshing) && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 z-50"
                    >
                        <motion.div
                            animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / threshold) * 360 }}
                            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                        >
                            <RefreshCw className={`h-6 w-6 ${pullDistance >= threshold ? "text-primary" : "text-muted-foreground"}`} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                animate={{ y: pullDistance > 0 ? pullDistance * 0.5 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
