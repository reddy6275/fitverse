"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, TrendingUp, Watch, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getWorkoutsToday,
    getTotalWorkouts,
    getWorkoutsThisWeek,
    getActiveMinutesToday,
    getCaloriesToday,
    getRecentWorkouts
} from "@/features/workout/services/workout-service";

export default function ActivityPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [workoutsToday, setWorkoutsToday] = useState(0);
    const [totalWorkouts, setTotalWorkouts] = useState(0);
    const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
    const [activeMinutes, setActiveMinutes] = useState(0);
    const [calories, setCalories] = useState(0);
    const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                const [today, total, weekly, minutes, cals, recent] = await Promise.all([
                    getWorkoutsToday(user.uid),
                    getTotalWorkouts(user.uid),
                    getWorkoutsThisWeek(user.uid),
                    getActiveMinutesToday(user.uid),
                    getCaloriesToday(user.uid),
                    getRecentWorkouts(user.uid, 5)
                ]);

                setWorkoutsToday(today);
                setTotalWorkouts(total);
                setWeeklyWorkouts(weekly);
                setActiveMinutes(minutes);
                setCalories(cals);
                setRecentWorkouts(recent);
            } catch (error) {
                console.error("Error fetching activity data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (loading) {
        return <ActivitySkeleton />;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Workouts Today</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workoutsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            {workoutsToday === 0 ? "No workouts yet" : workoutsToday === 1 ? "Great start!" : "On fire! 🔥"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWorkouts}</div>
                        <p className="text-xs text-muted-foreground">This week: {weeklyWorkouts}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Time</CardTitle>
                        <Watch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeMinutes} min</div>
                        <p className="text-xs text-muted-foreground">Today's workout time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calories</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{calories}</div>
                        <p className="text-xs text-muted-foreground">Burned today</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentWorkouts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No workouts yet. Start your first workout!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentWorkouts.map((workout) => {
                                const date = workout.date?.toDate ? workout.date.toDate() : new Date(workout.date);
                                const duration = Math.floor((workout.duration || 0) / 60);
                                const exerciseCount = workout.exercises?.length || 0;

                                return (
                                    <div key={workout.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Dumbbell className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="ml-4 space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">
                                                {workout.name || "Workout"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {exerciseCount} exercises • {duration} min
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    );
}
