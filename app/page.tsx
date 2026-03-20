"use client"
import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/nextjs";
import Connect from "./_components/Landing/Connect";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";
import ParticleNetwork from "./_components/Landing/ParticleNetwork";

export default function Home() {
    const { isLoaded, isSignedIn } = useUser();

    // Mouse tracking state for interactivity
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [mouseRaw, setMouseRaw] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalized position (-1 to 1) for parallax
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            });
            // Raw pixel position for spotlights
            setMouseRaw({
                x: e.clientX,
                y: e.clientY,
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
        <div className="min-h-screen bg-[#fafafa]">
            <div className="fixed inset-0 bg-[#fafafa] z-0" />
            {/* HERO */}
            <Navbar />
            <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen pt-32 pb-20 px-4 transition-colors duration-1000 ease-out bg-blue-700">
                {/* 
                  ====================================================
                  DENSE ABSTRACT BACKGROUND ECOSYSTEM & SPOTLIGHT
                  ==================================================== 
                */}


                <div className="max-w-7xl mx-auto w-full relative z-10 grid gap-12 lg:grid-cols-12 items-center">
                    {/* LEFT CONTENT - 6 Cols */}
                    <div className="lg:col-span-6 text-left space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-200 bg-white/60 backdrop-blur-md shadow-sm text-gray-800 text-xs tracking-[0.2em] uppercase font-light transition-transform hover:-translate-y-1 duration-500 cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700"></span>
                            </span>
                            Live Synchronization
                        </div>

                        <div className="space-y-4 relative">
                            {/* Decorative Line behind text */}
                            <div className="absolute -left-8 top-4 bottom-4 w-px bg-linear-to-b from-transparent via-blue-200 to-transparent opacity-50 hidden md:block" />

                            <h1 className="text-6xl md:text-7xl lg:text-[5rem] xl:text-[6rem] tracking-tighter text-gray-200 leading-none font-extralight group">
                                Master
                                <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-100 to-gray-400 inline-block transition-transform duration-700 group-hover:translate-x-4">
                                    the flow
                                </span>
                                <br />
                                <span className="italic text-transparent bg-clip-text bg-linear-to-r from-blue-100 via-blue-100 to-blue-50 pr-2">
                                    of time.
                                </span>
                            </h1>
                        </div>

                        <p className="text-xl md:text-2xl text-gray-100 max-w-xl leading-relaxed font-extralight tracking-wide pl-2 border-l border-transparent hover:border-gray-200 transition-colors duration-500">
                            A multidimensional scheduling engine that bends to your institution&apos;s will. Fluid, responsive, and infinitely scalable.
                        </p>

                        <div className="flex flex-wrap gap-6 pt-6">
                            {/* User NOT signed in */}
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="group relative flex items-center justify-center px-10 py-5 bg-black text-white rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98]">
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                        <span className="relative flex items-center gap-3 text-sm tracking-[0.2em] uppercase font-light">
                                            Initialize <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-2 transition-transform duration-500" />
                                        </span>
                                    </button>
                                </SignUpButton>
                            </SignedOut>

                            {/* User IS signed in */}
                            <SignedIn>
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="group relative flex items-center justify-center px-10 py-5 bg-black text-white rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                        <span className="relative flex items-center gap-3 tracking-[0.2em] uppercase font-light">
                                            Enter Hub <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-2 transition-transform duration-500" />
                                        </span>
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="group relative flex items-center justify-center px-10 py-5 bg-white border border-gray-200 text-gray-900 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] cursor-pointer"
                                    >
                                        <span className="relative flex items-center gap-3  tracking-[0.2em] uppercase font-light">
                                            Profile
                                        </span>
                                    </Link>
                                </>
                            </SignedIn>
                        </div>
                    </div>

                    {/* RIGHT HERO DYNAMIC ECOSYSTEM - 6 Cols */}
                    <div
                        className="lg:col-span-6 relative hidden lg:flex justify-center items-center h-[600px] animate-in fade-in zoom-in-95 duration-1000 delay-300 pointer-events-none bg-blue-700"
                        style={{ perspective: '1000px' }}
                    >
                        {/* 3D Wrapper responding to mouse */}
                        <div
                            className="relative w-full h-full flex justify-center items-center transition-transform duration-200 ease-out"
                            style={{
                                transform: `rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
                            }}
                        >
                            {/* Core Central Interface */}
                            <div className="absolute z-20 w-[380px] p-6 bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] pointer-events-auto transition-transform duration-700 hover:scale-[1.03]">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100/50">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-50" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-light">Global View</p>
                                    </div>
                                    {/* Schedule Lines Mock */}
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-4 items-center group cursor-default">
                                                <p className="text-xs text-gray-300 font-light w-10">0{8 + i}:00</p>
                                                <div className="flex-1 h-12 rounded-2xl bg-linear-to-r from-blue-50 to-transparent border border-blue-50/50 group-hover:border-blue-100 transition-colors p-3 flex flex-col justify-center">
                                                    <div className={`h-1 w-${16 + (i * 4)} bg-blue-200/50 rounded-full mb-2 group-hover:w-full transition-all duration-700`} />
                                                    <div className="h-0.5 w-8 bg-blue-100 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Orbiting Element 1 - Top Right - Moves FASTER via parallax */}
                            <div
                                className="absolute top-[10%] right-[5%] z-30 p-4 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.08)] animate-[bounce_4s_infinite_ease-in-out]"
                                style={{ transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px) translateZ(50px)` }}
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

                            {/* Orbiting Element 2 - Bottom Left - Moves FASTER opposite via parallax */}
                            <div
                                className="absolute bottom-[15%] left-[-5%] z-30 p-5 bg-[#111] backdrop-blur-xl border border-gray-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-[bounce_5s_infinite_ease-in-out_reverse]"
                                style={{ transform: `translateX(${-mousePosition.x * 20}px) translateY(${-mousePosition.y * 20}px) translateZ(30px)` }}
                            >
                                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-light mb-2">Efficiency</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-extralight text-white tracking-tighter">99.8</p>
                                    <p className="text-xs text-blue-400 font-light mb-1">%</p>
                                </div>
                                {/* Mini Graph */}
                                <div className="flex gap-1 mt-3 items-end h-6">
                                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-blue-500/50 rounded-t-sm transition-all duration-500 hover:bg-blue-400" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>

                            {/* Orbiting Element 3 - Top Left Floating Avatar List - Moves Deep */}
                            <div
                                className="absolute top-[20%] left-[5%] z-10 flex -space-x-3 hover:space-x-1 transition-all duration-500 animate-[bounce_6s_infinite_ease-in-out]"
                                style={{ transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 10}px) translateZ(-50px)` }}
                            >
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-${i}00 shadow-sm overflow-hidden bg-cover bg-center`}
                                        style={{ backgroundImage: `url('https://api.dicebear.com/7.x/notionists/svg?seed=${i}')` }} />
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center shadow-sm">
                                    <span className="text-[10px] text-gray-400 font-light">+42</span>
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

                {/* Vertical Scroll Indicator linking to Features */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-light writing-vertical-rl">Discover</span>
                    <div className="w-px h-12 bg-linear-to-b from-gray-400 to-transparent" />
                </div>
            </section>

            {/* FEATURES BENTO GRID */}
            <section className="py-24 px-4 relative max-w-7xl mx-auto w-full" >
                {/* Section header */}
                <div className="mb-20 space-y-4 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 origin-left" >
                    <h2 className="text-4xl lg:text-5xl tracking-tight text-gray-900 leading-[1.1] font-extralight">
                        A new paradigm for <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500 italic">
                            resource management.
                        </span>
                    </h2>
                    <p className="text-lg text-gray-400 font-extralight leading-relaxed pt-2">
                        Move beyond spreadsheets. Experience multidimensional scheduling that adapts to your institution&apos;s unique heartbeat.
                    </p>
                </div>

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300" >

                    {/* BENTO ITEM 1 - Large Span */}
                    <div className="md:col-span-2 lg:col-span-2 shadow-lg shadow-blue-700/20 row-span-2 group relative p-8 rounded-4xl bg-blue-600 border border-gray-100/50 backdrop-blur-xl overflow-hidden transition-all duration-700 hover:shadow-[0_20px_40px_-20px_rgba(59,130,246,0.15)] hover:border-blue-100 hover:-translate-y-1" >
                        <div className="relative z-10 flex flex-col h-full justify-between ">
                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                                {features[0].icon.props.children ? features[0].icon :
                                    Object.assign({}, features[0].icon, { props: { ...features[0].icon.props, className: features[0].icon.props.className.replace('text-blue-600 group-hover:text-white', '') } })}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-semibold text-white tracking-tight">
                                    {features[0].title}
                                </h3>
                                <p className="text-gray-300 font-extralight leading-relaxed max-w-sm">
                                    {features[0].description}
                                </p>
                            </div>
                        </div>
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] group-hover:bg-blue-400/20 transition-colors duration-700 pointer-events-none" />
                    </div>

                    {/* BENTO ITEM 2 - Tall Card */}
                    <div className="md:col-span-1 lg:col-span-1 shadow-lg shadow-indigo-700/20 row-span-2 group relative p-8 rounded-4xl bg-white/40 border border-gray-100/50 backdrop-blur-xl overflow-hidden transition-all duration-700 hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.15)] hover:border-indigo-100 hover:-translate-y-1" >
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-14 h-14 rounded-full bg-indigo-50/50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                                {features[1].icon.props.children ? features[1].icon :
                                    Object.assign({}, features[1].icon, { props: { ...features[1].icon.props, className: features[1].icon.props.className.replace('text-blue-600 group-hover:text-white', '') } })}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-800 tracking-tight leading-tight">
                                    {features[1].title}
                                </h3>
                                <p className="text-sm text-gray-500 font-extralight leading-relaxed">
                                    {features[1].description}
                                </p>
                            </div>
                        </div>
                        {/* Decorative abstract elements */}
                        <div className="absolute top-[20%] right-[-20%] w-32 h-64 bg-linear-to-b from-indigo-100/30 to-transparent rounded-full rotate-45 transform-gpu blur-[20px] pointer-events-none" />
                    </div>

                    {/* BENTO ITEM 3 - Small Card */}
                    <div className="md:col-span-3 shadow-lg shadow-purple-700/20 lg:col-span-1 row-span-1 group relative p-8 rounded-4xl bg-[#fafafa] border border-gray-100/50 overflow-hidden transition-all duration-700 hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(168,85,247,0.1)] hover:border-purple-100 hover:-translate-y-1" >
                        <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50/50 flex items-center justify-center text-purple-500 group-hover:rotate-12 transition-transform duration-500">
                                    {features[2].icon.props.children ? features[2].icon :
                                        Object.assign({}, features[2].icon, { props: { ...features[2].icon.props, className: features[2].icon.props.className.replace('text-blue-600 group-hover:text-white', 'w-5 h-5') } })}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                                    {features[2].title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-extralight leading-relaxed pl-14">
                                {features[2].description}
                            </p>
                        </div>
                    </div>

                    {/* BENTO ITEM 4 - Small Card */}
                    <div className="md:col-span-3 lg:col-span-1 row-span-1 group relative p-8 rounded-4xl bg-[#fafafa] border border-gray-100/50 overflow-hidden transition-all duration-700 hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.1)] hover:border-emerald-100 hover:-translate-y-1 shadow-lg shadow-emerald-700/20" >
                        <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50/50 flex items-center justify-center text-emerald-500 group-hover:-rotate-12 transition-transform duration-500">
                                    {features[3].icon.props.children ? features[3].icon :
                                        Object.assign({}, features[3].icon, { props: { ...features[3].icon.props, className: features[3].icon.props.className.replace('text-blue-600 group-hover:text-white', 'w-5 h-5') } })}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                                    {features[3].title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-extralight leading-relaxed pl-14">
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
