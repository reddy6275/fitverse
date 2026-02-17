"use client";

import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "amoled", "system"]}
            storageKey="fitverse-theme"
        >
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
    );
}
