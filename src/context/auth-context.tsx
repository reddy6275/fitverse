"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    signInWithGoogle: (rememberMe?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            }, (error) => {
                console.error("Auth state change error:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to initialize auth listener:", error);
            setLoading(false);
        }
    }, []);

    const signInWithEmail = async (email: string, password: string, rememberMe: boolean = true) => {
        try {
            // Set persistence based on Remember Me preference
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);

            // Sign in with email and password
            await signInWithEmailAndPassword(auth, email, password);

            // Store Remember Me preference
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth-remember-me', rememberMe.toString());
            }
        } catch (error) {
            console.error("Error signing in with email", error);
            throw error;
        }
    };

    const signInWithGoogle = async (rememberMe: boolean = true) => {
        const provider = new GoogleAuthProvider();
        try {
            // Set persistence based on Remember Me preference
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);

            // Sign in with Google
            await signInWithPopup(auth, provider);

            // Store Remember Me preference
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth-remember-me', rememberMe.toString());
            }
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);

            // Clear Remember Me preference
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-remember-me');
            }
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
