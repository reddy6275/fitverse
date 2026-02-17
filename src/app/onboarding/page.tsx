"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    age: z.number().min(10).max(100),
    gender: z.enum(["male", "female", "other"]),
    height: z.number().min(50).max(300), // cm
    weight: z.number().min(20).max(300), // kg
    goal: z.enum(["lose_weight", "build_muscle", "maintain", "improve_stamina"]),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Protect route
    useEffect(() => {
        if (!user && !isLoading) {
            // Ideally we check loading state from context too, but for now:
            // If auth loading is done and no user, redirect.
        }
    }, [user]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            age: 25,
            height: 170,
            weight: 70,
            gender: "male",
            goal: "maintain",
            activityLevel: "moderate",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                profile: values,
                stats: {
                    totalWorkouts: 0,
                    totalDistance: 0,
                    currentStreak: 0,
                },
                createAt: new Date(),
            }, { merge: true });

            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Tell us about yourself</CardTitle>
                    <CardDescription className="text-center">
                        To create your personalized plan, we need a few details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Enter age"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    unit="cm"
                                                    placeholder="Enter height"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight</FormLabel>
                                            <FormControl>
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    unit="kg"
                                                    placeholder="Enter weight"
                                                    allowDecimals
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="goal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Goal</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your goal" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="lose_weight">Lose Weight</SelectItem>
                                                <SelectItem value="build_muscle">Build Muscle</SelectItem>
                                                <SelectItem value="maintain">Maintain Physique</SelectItem>
                                                <SelectItem value="improve_stamina">Improve Stamina</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activityLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Activity Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select activity level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                                                <SelectItem value="light">Lightly Active (1-2 days/week)</SelectItem>
                                                <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                                                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                                                <SelectItem value="very_active">Very Active (Physical job + training)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Profile
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
