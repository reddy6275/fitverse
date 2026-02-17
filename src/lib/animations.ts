// Animation variants and utilities for Framer Motion

export const pageTransitions = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    slide: {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 },
        transition: { duration: 0.4, ease: "easeOut" }
    },
    slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
        transition: { duration: 0.4, ease: "easeOut" }
    },
    scale: {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.95, opacity: 0 },
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

export const cardHoverVariants = {
    rest: {
        scale: 1,
        y: 0,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
    }
};

export const buttonHoverVariants = {
    rest: {
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    hover: {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.95,
        transition: { duration: 0.1 }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

export const shimmerAnimation = {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
    }
};

// Haptic feedback utility (for mobile)
export const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30
        };
        navigator.vibrate(patterns[style]);
    }
};
