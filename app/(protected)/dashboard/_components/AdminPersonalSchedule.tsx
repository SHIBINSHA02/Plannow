"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/theme-provider"; // Imported theme hook

type Props = {
    organisationId: string;
};

export default function AdminPersonalSchedule({ organisationId }: Props) {
    // For MVP we will just render a simple view. In a full app, this would
    // fetch the admin's personal user ID and get their schedule exactly like
    // TeacherSchedulePage does.
    const { theme } = useTheme(); // Subscribed to current theme

    return (
        <div
            className={`border p-6 rounded-3xl transition-colors duration-200
                ${theme === "light"
                    ? "bg-white border-slate-100 shadow-sm shadow-blue-500/5"
                    : "bg-[#0f172a] border-slate-800"
                }`}
        >
            <h3
                className={`text-lg font-medium tracking-tight transition-colors duration-200
                    ${theme === "light" ? "text-slate-900" : "text-white"}`}
            >
                My Today's Schedule
            </h3>
            <p
                className={`text-xs font-light mb-6 transition-colors duration-200
                    ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}
            >
                Your personal schedule and substitutions
            </p>

            <div
                className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors duration-200
                    ${theme === "light"
                        ? "bg-slate-50 border-slate-100/70"
                        : "bg-slate-900/40 border-slate-800/60"
                    }`}
            >
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200
                        ${theme === "light"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-blue-950/40 text-blue-400"
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>

                <h4
                    className={`text-sm font-medium tracking-tight transition-colors duration-200
                        ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}
                >
                    No classes assigned today
                </h4>
                <p
                    className={`text-xs font-light mt-1.5 max-w-xs leading-relaxed transition-colors duration-200
                        ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}
                >
                    You don't have any classes or substitution duties scheduled for today in this organisation.
                </p>
            </div>
        </div>
    );
}