"use client";

import { useTheme } from "@/app/theme-provider";

export default function Loading() {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen p-6 md:p-10 space-y-10 transition-colors duration-200 ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#090d16]"}`}>
            {/* Header */}
            <div className="space-y-4">
                <div className={`h-10 w-1/3 rounded-xl animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                <div className={`h-6 w-1/4 rounded-lg animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
            </div>

            {/* Stats / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-40 rounded-2xl animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                ))}
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className={`h-8 w-1/4 rounded-xl animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                <div className="space-y-4">
                    <div className={`h-5 w-full rounded animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                    <div className={`h-5 w-11/12 rounded animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                    <div className={`h-5 w-10/12 rounded animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                    <div className={`h-5 w-9/12 rounded animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                </div>
            </div>

            {/* Table-like Rows */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-16 w-full rounded-2xl animate-pulse ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                ))}
            </div>
        </div>
    );
}