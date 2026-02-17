"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStreak, getActiveMinutes } from "@/features/workout/services/workout-service";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Plus, ChevronRight, Zap, Flame, Footprints, MessageSquare, Users, Dumbbell } from "lucide-react";
import Link from "next/link";

// New Premium Components
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { HeroWorkoutCard } from "@/components/dashboard/hero-workout-card";
import { StatsWheel } from "@/components/dashboard/stats-wheel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [activeMinutes, setActiveMinutes] = useState(0);

    // Dynamic Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchUserData() {
            if (!user) return;
            try {
                const [userDoc, calculatedStreak, calculatedMinutes] = await Promise.all([
                    getDoc(doc(db, "users", user.uid)),
                    getStreak(user.uid),
                    getActiveMinutes(user.uid)
                ]);

                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
                setStreak(calculatedStreak);
                setActiveMinutes(calculatedMinutes);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setDataLoading(false);
            }
        }
        fetchUserData();
    }, [user]);

    if (loading || dataLoading) {
        return <DashboardSkeleton />;
    }

    const stats = userData?.stats || {
        totalWorkouts: 0,
        totalDistance: 0,
        currentStreak: 0,
        totalVolume: 0
    };

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto w-full">

            {/* Header / Greeting */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-muted-foreground">
                        {greeting}, <span className="font-semibold text-foreground">{user?.displayName?.split(' ')[0] || "Athlete"}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Ready to crush your goals today?</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium border border-orange-500/20">
                        <Zap className="h-3 w-3 fill-current" />
                        <span>{streak} Day Streak</span>
                    </div>
                </div>
            </motion.div>

            {/* PRIMARY: Hero Section */}
            <section>
                <HeroWorkoutCard
                    workoutName="Full Body Power"
                    duration="45 min"
                    intensity="High"
                    onStart={() => router.push('/dashboard/workouts')}
                />
            </section>

            {/* SECONDARY: Stats Cluster */}
            <section className="grid gap-6 md:grid-cols-12">
                {/* Visual Circuar Stats */}
                <div className="md:col-span-4 lg:col-span-3">
                    <GlassPanel variant="card" className="h-[300px] flex flex-col justify-center items-center">
                        <StatsWheel
                            value={stats.totalVolume || 0}
                            max={50000}
                            label="Weekly Volume"
                            subLabel="kg Moved"
                            icon={<Dumbbell className="h-6 w-6" />}
                            color="var(--chart-1)"
                        />
                    </GlassPanel>
                </div>

                {/* Key Metrics Grid */}
                <div className="md:col-span-8 lg:col-span-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                        label="Workouts Completed"
                        value={stats.totalWorkouts}
                        subValue="+2 this week"
                        trend="up"
                        icon={<Dumbbell className="h-5 w-5" />}
                        delay={0.1}
                    />
                    <MetricCard
                        label="Calories Burned"
                        value="12,450"
                        subValue="kcal total"
                        trend="neutral"
                        icon={<Flame className="h-5 w-5" />}
                        delay={0.2}
                    />
                    <MetricCard
                        label="Active Minutes"
                        value={activeMinutes}
                        subValue="mins total"
                        trend="up"
                        icon={<ClockIcon className="h-5 w-5" />}
                        delay={0.3}
                    />
                </div>
            </section>

            {/* TERTIARY: Quick Tools & Navigation */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold tracking-tight">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <QuickActionCard
                        title="AI Coach"
                        icon={<MessageSquare className="h-5 w-5" />}
                        href="/dashboard/coach"
                        delay={0.4}
                    />
                    <QuickActionCard
                        title="Community"
                        icon={<Users className="h-5 w-5" />}
                        href="/dashboard/social"
                        delay={0.5}
                    />
                </div>
            </section>

            {/* Floating Operations (Mobile Friendly) */}
            <motion.div
                className="fixed bottom-6 right-6 z-50 md:hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Link href="/dashboard/workouts">
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl shadow-primary/50 bg-primary text-primary-foreground">
                        <Plus className="h-6 w-6" />
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}

// Helper Component for Quick Actions
function QuickActionCard({ title, icon, href, delay }: { title: string, icon: React.ReactNode, href: string, delay: number }) {
    return (
        <Link href={href}>
            <GlassPanel
                variant="card"
                className="p-4 flex flex-col items-center justify-center gap-3 h-24 hover:bg-white/5 transition-colors group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
            >
                <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <span className="text-sm font-medium">{title}</span>
            </GlassPanel>
        </Link>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-32 rounded-full" />
            </div>

            <Skeleton className="h-[300px] w-full rounded-2xl" />

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-4 lg:col-span-3">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
                <div className="md:col-span-8 lg:col-span-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-[140px] rounded-2xl" />
                    <Skeleton className="h-[140px] rounded-2xl" />
                    <Skeleton className="h-[140px] rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
