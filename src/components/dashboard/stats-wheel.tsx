import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsWheelProps {
    value: number;
    max: number;
    label: string;
    subLabel?: string;
    color?: string; // Hex or CSS var
    icon?: React.ReactNode;
    size?: number;
    className?: string;
}

export function StatsWheel({
    value,
    max,
    label,
    subLabel,
    color = "var(--primary)",
    icon,
    size = 120,
    className
}: StatsWheelProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                {/* Background Ring */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {icon && <div className="text-muted-foreground mb-1">{icon}</div>}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-bold text-2xl tracking-tighter"
                    >
                        {value.toLocaleString()}
                    </motion.div>
                    {subLabel && <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{subLabel}</div>}
                </div>
            </div>

            <div className="mt-2 text-center">
                <h4 className="font-medium text-sm">{label}</h4>
            </div>
        </div>
    );
}
