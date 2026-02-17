import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "card" | "sidebar";
}

export function GlassPanel({ children, className, variant = "default", ...props }: GlassPanelProps) {
    const variants = {
        default: "backdrop-blur-xl bg-background/80 border border-white/5",
        card: "backdrop-blur-xl bg-card/50 border border-white/5 shadow-xl shadow-black/5 hover:shadow-black/10 transition-all duration-300",
        sidebar: "backdrop-blur-2xl bg-sidebar/80 border-r border-white/5"
    };

    return (
        <motion.div
            className={cn(
                "rounded-2xl overflow-hidden relative",
                variants[variant],
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Ambient glow effect on hover for cards */}
            {variant === 'card' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}
        </motion.div>
    );
}
