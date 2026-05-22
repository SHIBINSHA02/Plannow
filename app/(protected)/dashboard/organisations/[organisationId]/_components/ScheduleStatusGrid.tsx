"use client";

import React from "react";
import { useScheduleGrid } from "./../../../context/ScheduleGridContext";
import { useTheme } from "@/app/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    CalendarCheck2,
    TrendingUp
} from "lucide-react";

const ScheduleStatusGrid: React.FC = () => {
    const { subjectsConfig, grid } = useScheduleGrid();
    const { theme } = useTheme();

    // Calculate total hours assigned per subject from the grid
    const assignedHours = React.useMemo(() => {
        const counts: Record<string, number> = {};
        grid.forEach((day) => {
            day.forEach((period) => {
                period.forEach((slot) => {
                    if (slot.subject) {
                        counts[slot.subject] = (counts[slot.subject] || 0) + 1;
                    }
                });
            });
        });
        return counts;
    }, [grid]);

    const stats = React.useMemo(() => {
        if (!subjectsConfig) return { totalRequired: 0, totalAssigned: 0, completedSubjects: 0 };

        let totalRequired = 0;
        let totalAssigned = 0;
        let completedSubjects = 0;

        subjectsConfig.forEach(s => {
            const assigned = assignedHours[s.subject] || 0;
            totalRequired += s.weeklyHours;
            totalAssigned += assigned;
            if (assigned >= s.weeklyHours) completedSubjects++;
        });

        return { totalRequired, totalAssigned, completedSubjects };
    }, [subjectsConfig, assignedHours]);

    if (!subjectsConfig || subjectsConfig.length === 0) return null;

    const overallPercentage = stats.totalRequired > 0
        ? Math.round((stats.totalAssigned / stats.totalRequired) * 100)
        : 0;

    return (
        <div className="mb-10 space-y-6">
            {/* Header / Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-4"
            >
                <div className={`lg:col-span-3 p-6 rounded-3xl shadow-2xl overflow-hidden relative text-white
                    ${theme === "light"
                        ? "bg-linear-to-br from-blue-600 via-blue-700 via-[80%] to-blue-500 shadow-blue-900/10"
                        : "bg-linear-to-br from-slate-900 via-blue-950/40 via-[80%] to-slate-900 shadow-black/40 border border-slate-800"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    <div
                        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <CalendarCheck2 className="w-7 h-7 text-blue-400" />
                                Schedule Progress
                            </h2>
                            <p className={`${theme === "light" ? "text-blue-100" : "text-slate-400"} text-sm max-w-md`}>
                                Track your classroom's weekly goal completion. Ensure all subject hours are distributed efficiently across the schedule.
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-semibold">{stats.totalAssigned}/{stats.totalRequired}</div>
                                <div className={`text-[10px] uppercase tracking-wider font-bold ${theme === "light" ? "text-blue-200" : "text-slate-500"}`}>Total Hours</div>
                            </div>
                            <div className={`h-12 w-px hidden md:block ${theme === "light" ? "bg-white/20" : "bg-slate-800"}`}></div>
                            <div className="text-center">
                                <div className="text-3xl font-semibold">{stats.completedSubjects}/{subjectsConfig.length}</div>
                                <div className={`text-[10px] uppercase tracking-wider font-bold ${theme === "light" ? "text-blue-200" : "text-slate-500"}`}>Subjects Ready</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 relative pt-4">
                        <div className={`flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter ${theme === "light" ? "text-blue-100" : "text-slate-400"}`}>
                            <span>Total Completion</span>
                            <span>{overallPercentage}%</span>
                        </div>
                        <div className={`h-3 w-full rounded-full overflow-hidden backdrop-blur-sm ${theme === "light" ? "bg-white/20" : "bg-slate-800"}`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full shadow-[0_0_15px_rgba(59,130,246,0.5)] ${theme === "light" ? "bg-white" : "bg-blue-500"}`}
                            />
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-3xl flex flex-col justify-center items-center text-center space-y-2 relative overflow-hidden border
                    ${theme === "light"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-100"
                    }`}
                >
                    <div
                        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 450 450' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 z-10
                        ${theme === "light" ? "bg-blue-50 text-blue-600" : "bg-blue-950/50 text-blue-400"}`}
                    >
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold z-10">{overallPercentage >= 100 ? "Ready!" : "In Progress"}</div>
                    <p className={`text-xs font-medium leading-tight z-10 ${theme === "light" ? "text-white/90" : "text-slate-400"}`}>
                        {overallPercentage < 100
                            ? `${stats.totalRequired - stats.totalAssigned} hours remaining until optimal coverage.`
                            : "Your schedule has reached full capacity. Great job!"}
                    </p>
                </div>
            </motion.div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                    {subjectsConfig.map((subject, index) => {
                        const assigned = assignedHours[subject.subject] || 0;
                        const total = subject.weeklyHours;
                        const percentage = Math.min(Math.round((assigned / total) * 100), 100);

                        const isComplete = assigned === total;
                        const isOver = assigned > total;

                        let cardStyle = "";
                        if (theme === "light") {
                            cardStyle = isOver
                                ? "bg-red-50 border-red-200"
                                : isComplete
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md";
                        } else {
                            cardStyle = isOver
                                ? "bg-red-950/20 border-red-900/50 text-slate-100"
                                : isComplete
                                    ? "bg-blue-950/20 border-blue-900/50 text-slate-100"
                                    : "bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700 hover:shadow-md";
                        }

                        return (
                            <motion.div
                                key={subject.subject}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-5 rounded-xl border transition-all duration-300 ${cardStyle}`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className={`font-semibold text-sm ${theme === "light" ? "text-gray-900" : "text-slate-200"}`}>
                                            {subject.subject}
                                        </h3>

                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 dark:text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            Target {total}h
                                        </div>
                                    </div>

                                    {/* Status Icon */}
                                    <div
                                        className={`p-1.5 rounded-lg
                                            ${isOver
                                                ? (theme === "light" ? "bg-red-100 text-red-600" : "bg-red-950 text-red-400")
                                                : isComplete
                                                    ? (theme === "light" ? "bg-blue-100 text-blue-600" : "bg-blue-950 text-blue-400")
                                                    : (theme === "light" ? "bg-gray-100 text-gray-500" : "bg-slate-800 text-slate-400")
                                            }`}
                                    >
                                        {isComplete && !isOver ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : isOver ? (
                                            <AlertCircle className="w-4 h-4" />
                                        ) : (
                                            <span className="text-[11px] font-medium">{percentage}%</span>
                                        )}
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex justify-between items-end mb-3">
                                    <span
                                        className={`text-lg font-semibold
                                            ${isOver
                                                ? "text-red-500"
                                                : isComplete
                                                    ? "text-blue-500"
                                                    : (theme === "light" ? "text-gray-800" : "text-slate-300")
                                            }`}
                                    >
                                        {assigned}
                                        <span className={`text-xs font-medium ml-1 ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                                            / {total}h
                                        </span>
                                    </span>

                                    {isOver && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${theme === "light" ? "bg-red-100 text-red-600" : "bg-red-950 text-red-400"}`}>
                                            exceeded
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === "light" ? "bg-gray-100" : "bg-slate-800"}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={`h-full rounded-full
                                            ${isOver
                                                ? "bg-red-500"
                                                : isComplete
                                                    ? "bg-blue-600"
                                                    : "bg-blue-500"
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ScheduleStatusGrid;