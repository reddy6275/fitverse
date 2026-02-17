"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    type?: "fade" | "slide" | "scale";
}

export function PageTransition({ children, type = "fade" }: PageTransitionProps) {
    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { x: 20, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: -20, opacity: 0 },
        },
        scale: {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.95, opacity: 0 },
        },
    };

    const selectedVariant = variants[type];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={selectedVariant.initial}
                animate={selectedVariant.animate}
                exit={selectedVariant.exit}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
