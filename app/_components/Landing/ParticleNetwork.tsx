"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
}

interface ParticleNetworkProps {
    colors?: string[]; // Array of hex colors for particles
    particleCount?: number;
    interactionRadius?: number;
}

export default function ParticleNetwork({
    colors = ['#60A5FA', '#818CF8', '#A78BFA'], // Blue, Indigo, Purple
    particleCount = 120,
    interactionRadius = 150
}: ParticleNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const isMouseInRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Configuration
        const MAX_DISTANCE = 120; // Max distance for drawing lines between particles

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const createParticle = (): Particle => {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1, // Slow drift
                vy: (Math.random() - 0.5) * 1,
                radius: Math.random() * 1.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            };
        };

        const initParticles = () => {
            particlesRef.current = [];
            // Adjust count based on screen size dynamically
            const area = (canvas.width * canvas.height) / 10000;
            const dynamicCount = Math.min(particleCount, Math.floor(area) * 2); // Cap at requested count

            for (let i = 0; i < dynamicCount; i++) {
                particlesRef.current.push(createParticle());
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;
            const isMouseIn = isMouseInRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges smoothly
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Clamp to ensure they don't get stuck outside
                p.x = Math.max(0, Math.min(canvas.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height, p.y));

                // Interaction with Mouse (Repel)
                if (isMouseIn) {
                    const dxMouse = p.x - mouseX;
                    const dyMouse = p.y - mouseY;
                    const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
                    const interactRadiusSq = interactionRadius * interactionRadius;

                    if (distMouseSq < interactRadiusSq) {
                        const distMouse = Math.sqrt(distMouseSq);
                        const force = (interactionRadius - distMouse) / interactionRadius;

                        // Push away
                        p.x += (dxMouse / distMouse) * force * 5;
                        p.y += (dyMouse / distMouse) * force * 5;
                    }
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                // Add a slight glow to particles
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0; // Reset

                // Check connections with other particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < MAX_DISTANCE * MAX_DISTANCE) {
                        const dist = Math.sqrt(distSq);
                        const opacity = 1 - (dist / MAX_DISTANCE);

                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        // Subtle gradient style line or just semi-transparent
                        ctx.strokeStyle = `rgba(156, 163, 175, ${opacity * 0.15})`; // Very faint gray lines
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        // Event Listeners
        window.addEventListener('resize', setCanvasSize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            isMouseInRef.current = true;
        };
        const handleMouseLeave = () => {
            isMouseInRef.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave); // when leaving viewport

        // Init
        setCanvasSize();
        draw();

        // Cleanup
        return () => {
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [colors, particleCount, interactionRadius]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ width: '100vw', height: '100vh' }} // Ensure it covers the fixed viewport
        />
    );
}
