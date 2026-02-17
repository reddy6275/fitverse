"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    w: number;
    h: number;
    dx: number;
    dy: number;
    color: string;
    tilt: number;
    tiltAngle: number;
    tiltAngleIncr: number;
}

export function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        const particles: Particle[] = [];
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"];

        const createParticle = (): Particle => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: Math.random() * Math.PI,
            tiltAngleIncr: Math.random() * 0.1 + 0.05,
        });

        // Initialize particles
        for (let i = 0; i < 100; i++) {
            particles.push(createParticle());
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.tiltAngle += p.tiltAngleIncr;
                p.tilt = Math.sin(p.tiltAngle) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.w / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.w / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.h / 2);
                ctx.stroke();

                p.y += p.dy;
                p.x += Math.sin(p.tiltAngle) * 2;

                // Respawn
                if (p.y > canvas.height) {
                    particles[i] = createParticle();
                    particles[i].y = -20; // Start above
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Stop after 5 seconds to not be annoying
        const timeout = setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 5000);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: "100%", height: "100%" }}
        />
    );
}
