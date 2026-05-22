"use client";

import OrganisationsClient from "./_components/OrganisationsClient";
import { Sparkles, Activity, Layers } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export default function OrganisationPage() {
    const { theme } = useTheme();

    return (
        <main
            className={`min-h-screen antialiased max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 transition-colors duration-200
                ${theme === "light" ? "bg-[#F8FAFC] text-slate-800" : "bg-[#090d16] text-slate-300"}`}
        >
            {/* Header Section */}
            <header
                className={`px-8 py-10 border rounded-3xl shadow-sm transition-all duration-200
                    ${theme === "light"
                        ? "border-slate-100 bg-white shadow-blue-500/5"
                        : "border-slate-800 bg-[#0f172a] shadow-none"}`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h1 className={`text-2xl font-light tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                            Organization <span className={`${theme === "light" ? "text-blue-600" : "text-blue-400"} font-normal`}>Dashboard</span>
                        </h1>
                        <p className={`text-sm font-light max-w-md leading-relaxed ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                            "Efficiency is doing things right; effectiveness is doing the right things."
                        </p>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <section className="pb-12">
                <OrganisationsClient />
            </section>
        </main>
    );
}