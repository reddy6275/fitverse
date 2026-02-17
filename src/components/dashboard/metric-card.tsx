import { motion } from "framer-motion";
import { GlassPanel } from "./glass-panel";

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: "up" | "down" | "neutral";
    icon?: React.ReactNode;
    delay?: number;
}

export function MetricCard({ label, value, subValue, trend, icon, delay = 0 }: MetricCardProps) {
    return (
        <GlassPanel
            variant="card"
            className="p-6 flex flex-col justify-between h-[140px] hover:border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <div className="flex justify-between items-start">
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
                {icon && <div className="text-primary/80">{icon}</div>}
            </div>

            <div className="mt-auto">
                <motion.div
                    className="text-3xl font-bold tracking-tight"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.2 }}
                >
                    {value}
                </motion.div>
                {subValue && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {subValue}
                        </span>
                    </div>
                )}
            </div>
        </GlassPanel>
    );
}
