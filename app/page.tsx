"use client";

import { Calendar, Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Connect from "./_components/Landing/Connect";
import Footer from "./_components/Landing/Footer";
import Navbar from "./_components/Navbar";

export default function Home() {
    const { isLoaded, isSignedIn } = useUser();

    if (!isLoaded) return null;

    const features = [
        {
            icon: <Calendar className="w-8 h-8 text-indigo-600" />,
            title: "Smart Scheduling",
            description:
                "AI-powered schedule optimization that considers teacher preferences, room availability, and student needs.",
        },
        {
            icon: <Clock className="w-8 h-8 text-indigo-600" />,
            title: "Time Management",
            description:
                "Effortlessly manage class timings, break schedules, and substitutes.",
        },
        {
            icon: <Users className="w-8 h-8 text-indigo-600" />,
            title: "Team Collaboration",
            description:
                "Seamless coordination between teachers and administrators.",
        },
        {
            icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
            title: "Resource Planning",
            description:
                "Optimize classroom and resource allocation with zero conflicts.",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* HERO */}
            <Navbar />
            <section className="flex items-center justify-center py-20 m-4 rounded-3xl bg-gradient-to-t from-blue-200 via-white to-blue-200 lg:h-[70vh]">
                <div className="grid gap-12 px-4 max-w-7xl lg:grid-cols-2">
                    {/* LEFT */}
                    <div>
                        <h1 className="text-4xl font-semibold md:text-6xl">
                            Revolutionize Your{" "}
                            <span className="text-indigo-600">School Scheduling</span>
                        </h1>

                        <p className="mt-6 text-xl text-gray-600">
                            Streamline teacher schedules and optimize resources with intelligent automation.
                        </p>

                        <div className="flex flex-col gap-4 mt-8 sm:flex-row">
                            {isSignedIn ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center justify-center px-8 py-4 text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700"
                                    >
                                        Visit Profile <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>

                                    <Link
                                        href="/dashboard"
                                        className="flex items-center justify-center px-8 py-4 text-indigo-600 border-2 border-indigo-600 rounded-3xl hover:bg-indigo-50"
                                    >
                                        Manage Organization
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/sign-up"
                                    className="flex items-center justify-center px-8 py-4 text-white bg-indigo-600 rounded-3xl hover:bg-indigo-700"
                                >
                                    Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative">
                        <div className="p-6 bg-white shadow-2xl rounded-3xl rotate-3">
                            <div className="p-4 mb-4 bg-indigo-600 rounded-xl">
                                <Calendar className="w-8 h-8 mx-auto text-white" />
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <span className="block text-sm font-medium">
                                        Math – Room 204
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        9:00 AM – 10:30 AM
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <span className="block text-sm font-medium">
                                        Science – Lab 1
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        11:00 AM – 12:30 PM
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* FEATURES */}
            <section className="py-20 mx-3">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Section header */}
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-3xl md:text-4xl font-semibold">
                            Everything you need to manage schedules
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Powerful features designed to simplify planning, coordination, and execution.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative p-8 bg-white rounded-3xl border border-gray-200
                     shadow-sm transition-all duration-300
                     hover:-translate-y-1 hover:shadow-xl"
                            >
                                {/* Icon */}
                                <div
                                    className="flex items-center justify-center w-14 h-14 mb-6
                       rounded-2xl bg-indigo-50 text-indigo-600
                       group-hover:bg-indigo-600 group-hover:text-white
                       transition-colors duration-300"
                                >
                                    {feature.icon}
                                </div>

                                {/* Text */}
                                <h3 className="text-lg font-semibold mb-2">
                                    {feature.title}
                                </h3>

                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Subtle hover glow */}
                                <div className="absolute inset-0 rounded-3xl ring-1 ring-indigo-500/0 group-hover:ring-indigo-500/20 transition" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            <Connect />
            <Footer />
        </div>
    );
}
