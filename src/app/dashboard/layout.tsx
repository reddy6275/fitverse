"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    LayoutDashboard,
    Dumbbell,
    Activity,
    MessageSquare,
    Users,
    Menu,
    LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/dashboard/workouts", icon: Dumbbell },
    { name: "AI Coach", href: "/dashboard/coach", icon: MessageSquare },
    { name: "Activity", href: "/dashboard/activity", icon: Activity },
    { name: "Social", href: "/dashboard/social", icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="icon" className="shrink-0 overflow-hidden">
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: isSidebarOpen ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="h-5 w-5" />
                                </motion.div>
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </motion.div>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col w-[300px] sm:w-[350px]">
                        <SheetHeader className="px-1 text-left">
                            <SheetTitle className="flex items-center gap-2">
                                <Activity className="h-6 w-6" />
                                <span>FitVerse AI</span>
                            </SheetTitle>
                            <SheetDescription>
                                Navigate through your fitness journey.
                            </SheetDescription>
                        </SheetHeader>
                        <nav className="grid gap-2 text-lg font-medium mt-4">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-3 py-2 transition-all hover:text-foreground",
                                        pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                            <div className="my-2 border-t" />
                            <Button variant="ghost" className="justify-start gap-4 px-3" onClick={() => logout()}>
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex-1 flex items-center justify-between">
                    <span className="font-semibold text-lg hidden sm:inline-block">
                        {sidebarItems.find(item => item.href === pathname)?.name || "Dashboard"}
                    </span>
                    <span className="font-semibold text-lg sm:hidden">
                        FitVerse AI
                    </span>
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </div >
    );
}
