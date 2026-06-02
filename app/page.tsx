// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/nextjs";
import Connect from "./_components/Landing/Connect";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";

export default function Home() {
    const { isLoaded } = useUser();

    // Mouse tracking state for interactivity
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalized position (-1 to 1) for parallax
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    if (!isLoaded) return null;

    const features = [
        {
            icon: <Calendar className="w-8 h-8 text-blue-600 group-hover:text-white" />,
            title: "Smart Scheduling",
            description:
                "AI-powered schedule optimization that considers teacher preferences, room availability, and student needs.",
        },
        {
            icon: <Clock className="w-8 h-8 text-blue-600 group-hover:text-white" />,
            title: "Time Management",
            description:
                "Effortlessly manage class timings, break schedules, and substitutes.",
        },
        {
            icon: <Users className="w-8 h-8 text-blue-600 group-hover:text-white" />,
            title: "Team Collaboration",
            description:
                "Seamless coordination between teachers and administrators.",
        },
        {
            icon: <BookOpen className="w-8 h-8 text-blue-600 group-hover:text-white" />,
            title: "Resource Planning",
            description:
                "Optimize classroom and resource allocation with zero conflicts.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
            <div className="fixed inset-0 bg-[#fafafa] z-0" />
            
            {/* HERO */}
            <Navbar />
            
            {/* ADJUSTED: Adjusted top padding to pt-24 on mobile so layout stays tightly inside the viewport safely */}
            <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4 transition-colors duration-1000 ease-out bg-blue-700">

                {/* Noise Layer */}
                <div
                    className="absolute inset-0 opacity-70 pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />

                <div className="max-w-7xl mx-auto w-full relative z-10 grid gap-8 lg:gap-12 lg:grid-cols-12 items-center">
                    
                    {/* LEFT CONTENT - 6 Cols */}
                    {/* ADJUSTED: Softened vertical spacing gap (space-y-6 sm:space-y-10) for tighter mobile windows */}
                    <div className="lg:col-span-6 text-left space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        
                        <div className="inline-flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-gray-200 bg-white/60 backdrop-blur-md shadow-xs text-gray-800 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light transition-transform hover:-translate-y-1 duration-500 cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700"></span>
                            </span>
                            Live Synchronization
                        </div>

                        <div className="space-y-4 relative">
                            <div className="absolute -left-8 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-50 hidden md:block" />

                            {/* ADJUSTED: Changed text-6xl base to text-4xl scaling to text-6xl on standard mobile up to text-[5rem]+ on desktop */}
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[6rem] tracking-tighter text-gray-200 leading-tight sm:leading-none font-extralight group break-words">
                                Master the flow
                                <br/>
                                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-blue-100 to-blue-50 pr-2">
                                    of time.
                                </span>
                            </h1>
                        </div>

                        {/* ADJUSTED: Reduced text size on extreme small widths (text-base sm:text-xl) so paragraph fits beautifully */}
                        <p className="text-base sm:text-xl md:text-2xl text-gray-100 max-w-xl leading-relaxed font-extralight tracking-wide pl-2 border-l border-transparent hover:border-gray-200 transition-colors duration-500">
                            A multidimensional scheduling engine that bends to your institution&apos;s will. Fluid, responsive, and infinitely scalable.
                        </p>

                        {/* ADJUSTED: Switched from generic flex-wrap to an optimized mobile-first cluster arrangement */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-2 sm:pt-6">
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="group relative flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-black text-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98] w-full sm:w-auto">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                        <span className="relative flex items-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase font-light">
                                            Initialize <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-2 transition-transform duration-500" />
                                        </span>
                                    </button>
                                </SignUpButton>
                            </SignedOut>

                            <SignedIn>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <Link
                                        href="/dashboard"
                                        className="group relative flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-black text-white rounded-xl sm:rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98] text-center w-full sm:w-auto"
                                    >
                                        <span className="relative flex items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase font-light">
                                            Enter Hub <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-2 transition-transform duration-500" />
                                        </span>
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="group relative flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-white border border-gray-200 text-gray-900 rounded-xl sm:rounded-full transition-all duration-500 hover:scale-[1.02] hover:shadow-xs active:scale-[0.98] text-center w-full sm:w-auto"
                                    >
                                        <span className="relative flex items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase font-light">
                                            Profile
                                        </span>
                                    </Link>
                                </div>
                            </SignedIn>
                        </div>
                    </div>

                    {/* RIGHT HERO DYNAMIC ECOSYSTEM - 6 Cols (Untouched desktop wrapper rules) */}
                    <div
                        className="lg:col-span-6 relative hidden lg:flex justify-center items-center h-[600px] animate-in fade-in zoom-in-95 duration-1000 delay-300 pointer-events-none"
                        style={{ perspective: '1000px' }}
                    >
                        <div className="relative w-full h-full flex justify-center items-center transition-transform duration-200 ease-out">
                            {/* Core Central Interface */}
                            <div className="absolute z-20 w-[380px] p-6 bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] pointer-events-auto transition-transform duration-700 hover:scale-[1.03]">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100/50">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-50" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-light">Global View</p>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-4 items-center group cursor-default">
                                                <p className="text-xs text-gray-300 font-light w-10">0{8 + i}:00</p>
                                                <div className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-50/50 group-hover:border-blue-100 transition-colors p-3 flex flex-col justify-center">
                                                    <div className="h-1 w-24 bg-blue-200/50 rounded-full mb-2" />
                                                    <div className="h-0.5 w-8 bg-blue-100 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Orbiting Element 1 */}
                            <div
                                className="absolute top-[10%] right-[5%] z-30 p-4 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.08)] animate-[bounce_4s_infinite_ease-in-out]"
                                style={{
                                    transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px)`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] tracking-widest uppercase text-gray-400 font-light mb-0.5">Alert</p>
                                        <p className="text-sm font-light text-gray-800 tracking-tight">Conflict Resolved</p>
                                    </div>
                                </div>
                            </div>

                            {/* Orbiting Element 2 */}
                            <div
                                className="absolute bottom-[15%] left-[-5%] z-30 p-5 bg-[#111] backdrop-blur-xl border border-gray-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-[bounce_5s_infinite_ease-in-out_reverse]"
                                style={{ transform: `translateX(${-mousePosition.x * 20}px) translateY(${-mousePosition.y * 20}px)` }}
                            >
                                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-light mb-2">Efficiency</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-extralight text-white tracking-tighter">99.8</p>
                                    <p className="text-xs text-blue-400 font-light mb-1">%</p>
                                </div>
                            </div>

                            {/* Connection Lines (SVGs) Behind */}
                            <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-20" viewBox="0 0 600 600">
                                <circle cx="300" cy="300" r="250" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" strokeDasharray="4 4" />
                                <circle cx="300" cy="300" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Vertical Scroll Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-light">Discover</span>
                    <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
                </div>
            </section>

            {/* FEATURES BENTO GRID */}
            {/* ADJUSTED: Added overflow-hidden layer and fluid padding bounds to protect grid cards */}
            <section className="py-20 px-4 relative max-w-7xl mx-auto w-full overflow-hidden">
                <div className="mb-16 space-y-4 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 origin-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-gray-900 leading-[1.2] font-extralight">
                        A new paradigm for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic">
                            resource management.
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-400 font-extralight leading-relaxed pt-2">
                        Move beyond spreadsheets. Experience multidimensional scheduling that adapts to your institution&apos;s unique heartbeat.
                    </p>
                </div>

                {/* BENTO GRID */}
                {/* ADJUSTED: Replaced arbitrary row parameters on mobile configurations to build robust natural vertical flows */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto md:auto-rows-[250px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">

                    {/* BENTO ITEM 1 */}
                    <div className="md:col-span-2 lg:col-span-2 min-h-[300px] md:min-h-0 row-span-2 group relative p-6 sm:p-8 rounded-3xl bg-blue-600 border border-gray-100/50 backdrop-blur-xl overflow-hidden shadow-lg shadow-blue-700/20 transition-all duration-700 hover:-translate-y-1">
                        <div className="relative z-10 flex flex-col h-full justify-between gap-8 md:gap-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center text-blue-600">
                                {features[0].icon}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                                    {features[0].title}
                                </h3>
                                <p className="text-blue-100 text-sm sm:text-base font-extralight leading-relaxed max-w-sm">
                                    {features[0].description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BENTO ITEM 2 */}
                    <div className="md:col-span-1 lg:col-span-1 min-h-[250px] md:min-h-0 row-span-2 group relative p-6 sm:p-8 rounded-3xl bg-white border border-gray-100/50 shadow-lg shadow-indigo-700/5 overflow-hidden transition-all duration-700 hover:-translate-y-1">
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6 md:gap-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                {features[1].icon}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-gray-700 tracking-tight leading-tight">
                                    {features[1].title}
                                </h3>
                                <p className="text-sm text-gray-500 font-extralight leading-relaxed">
                                    {features[1].description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BENTO ITEM 3 */}
                    <div className="md:col-span-3 lg:col-span-1 group relative p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-gray-100/50 overflow-hidden transition-all duration-700 hover:bg-white hover:-translate-y-1 shadow-md shadow-purple-700/5">
                        <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="text-purple-500 flex-shrink-0">{features[2].icon}</div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 tracking-tight">
                                    {features[2].title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-extralight leading-relaxed lg:pl-12">
                                {features[2].description}
                            </p>
                        </div>
                    </div>

                    {/* BENTO ITEM 4 */}
                    <div className="md:col-span-3 lg:col-span-1 group relative p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-gray-100/50 overflow-hidden transition-all duration-700 hover:bg-white hover:-translate-y-1 shadow-md shadow-emerald-700/5">
                        <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="text-emerald-500 flex-shrink-0">{features[3].icon}</div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 tracking-tight">
                                    {features[3].title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-extralight leading-relaxed lg:pl-12">
                                {features[3].description}
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <Connect />
            <Footer />
        </div>
    );
}