"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AICoachPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: `Hi ${user?.displayName || "there"}! I'm your AI Coach. How can I help you train today?` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const newMessages = [...messages, { role: "user", content: input } as Message];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        console.log('🔵 Sending message to AI Coach...');
        console.log('📨 Messages:', newMessages);
        console.log('👤 User ID:', user.uid);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    userId: user.uid
                }),
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response OK:', response.ok);

            if (!response.ok) {
                console.error('❌ Response not OK:', response.status, response.statusText);
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Received data:', data);

            if (!data || !data.content) {
                console.error('❌ Invalid response format:', data);
                throw new Error('Invalid response format from API');
            }

            console.log('✅ AI Response:', data.content.substring(0, 100) + '...');
            setMessages((prev) => [...prev, data]);
        } catch (error: any) {
            console.error('❌ Frontend error:', error);
            console.error('❌ Error message:', error.message);

            // Fallback error message
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `Sorry, I'm having trouble connecting right now. Error: ${error.message}. Please check the console for details.`
            }]);
        } finally {
            setIsLoading(false);
            console.log('✅ Request complete');
        }
    };

    return (
        <Card className="h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">AI Personal Trainer</CardTitle>
                        <p className="text-xs text-muted-foreground">Powered by FitVerse Intelligence</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                            {messages.map((m, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        "flex gap-2 max-w-[80%]",
                                        m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 mt-1">
                                        {m.role === "assistant" ? (
                                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                        ) : (
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        )}
                                    </Avatar>
                                    <motion.div
                                        className={cn(
                                            "rounded-lg px-3 py-2 text-sm",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {m.content}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isLoading && (
                            <motion.div
                                className="flex gap-2 max-w-[80%] mr-auto"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-3 py-2 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            </motion.div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex-col border-t p-4 gap-2">
                <div className="flex gap-2 w-full overflow-x-auto pb-2">
                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setInput("Generate a 30-minute HIIT workout")}>
                        30-min HIIT
                    </Button>
                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setInput("I have back pain, suggest safe exercises")}>
                        Injury Advice
                    </Button>
                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setInput("Create a meal plan for weight loss")}>
                        Meal Plan
                    </Button>
                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setInput("Explain progressive overload")}>
                        Fitness Tips
                    </Button>
                </div>
                <form
                    className="flex w-full items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <Input
                        placeholder="Ask for a workout plan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
