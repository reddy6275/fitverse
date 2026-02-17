"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { Dumbbell, Brain, Target, Activity, BarChart3, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxSection } from "@/components/parallax-section";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">FitVerse AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <ParallaxSection offset={30}>
          <motion.div
            className="max-w-3xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Fitness Platform
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Your Personal AI
              <span className="gradient-text"> Fitness Coach</span>
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Track workouts and activities. Get personalized AI coaching. Join a community of fitness enthusiasts.
            </motion.p>
            <motion.div
              className="flex gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link href="/signup">
                <AnimatedButton size="lg" className="gap-2 btn-glow-primary">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </AnimatedButton>
              </Link>
              <Link href="/login">
                <AnimatedButton size="lg" variant="outline">
                  Sign In
                </AnimatedButton>
              </Link>
            </motion.div>
          </motion.div>
        </ParallaxSection>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Everything You Need to Succeed
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <FeatureCard
            icon={<Dumbbell className="h-10 w-10 text-primary" />}
            title="Workout Tracking"
            description="Log exercises, track PRs, and monitor your progress with detailed analytics."
          />
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-primary" />}
            title="AI Personal Trainer"
            description="Get personalized workout plans and coaching powered by advanced AI."
          />
          <FeatureCard
            icon={<Target className="h-10 w-10 text-primary" />}
            title="Goal Setting"
            description="Set and track fitness goals with smart milestones and reminders."
          />
          <FeatureCard
            icon={<Activity className="h-10 w-10 text-primary" />}
            title="Activity Monitoring"
            description="Track steps, runs, and cycling activities with detailed metrics."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Progress Tracking"
            description="Visualize your journey with workout stats and weekly summaries."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Social Community"
            description="Connect with friends, join challenges, and compete on leaderboards."
          />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          className="bg-primary text-primary-foreground rounded-2xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of users achieving their fitness goals with FitVerse AI</p>
            <Link href="/signup">
              <AnimatedButton size="lg" variant="secondary" className="gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 FitVerse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      className="p-6 rounded-lg border bg-card hover-lift transition-smooth"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="mb-4"
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
