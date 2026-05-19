"use client";

import React from "react";
import { useScheduleGrid } from "./../../../context/ScheduleGridContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    AlertCircle,
    Info,
    BarChart3,
    Clock,
    CalendarCheck2,
    TrendingUp
} from "lucide-react";

const ScheduleStatusGrid: React.FC = () => {
    const { subjectsConfig, grid } = useScheduleGrid();

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
                <div className="lg:col-span-3 p-6 bg-linear-to-br from-blue-700 via-blue-800 via-[80%] to-blue-600 rounded-3xl shadow-2xl shadow-blue-900/20 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-700 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    <div
                        className="absolute inset-0 opacity-60 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <CalendarCheck2 className="w-7 h-7" />
                                Schedule Progress
                            </h2>
                            <p className="text-blue-100 text-sm max-w-md">
                                Track your classroom's weekly goal completion. Ensure all subject hours are distributed efficiently across the schedule.
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-black font-semibold">{stats.totalAssigned}/{stats.totalRequired}</div>
                                <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Total Hours</div>
                            </div>
                            <div className="h-12 w-px bg-white/20 hidden md:block"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black font-semibold">{stats.completedSubjects}/{subjectsConfig.length}</div>
                                <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Subjects Ready</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 relative pt-4">
                        <div className="flex justify-between text-xs font-bold mb-2 text-blue-100 uppercase tracking-tighter">
                            <span>Total Completion</span>
                            <span>{overallPercentage}%</span>
                        </div>
                        <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6  rounded-3xl  shadow-blue-900/5 flex flex-col justify-center items-center text-center space-y-2 bg-blue-700">
                    <div
                        className="absolute inset-0 opacity-60 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 450 450' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-white">{overallPercentage >= 100 ? "Ready!" : "In Progress"}</div>
                    <p className="text-xs text-white font-medium leading-tight">
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

                        return (
                            <motion.div
                                key={subject.subject}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-5 rounded-xl border transition-all duration-300 
          ${isOver
                                        ? "bg-red-50 border-red-200"
                                        : isComplete
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-gray-900 font-semibold text-sm">
                                            {subject.subject}
                                        </h3>

                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock className="w-3 h-3" />
                                            Target {total}h
                                        </div>
                                    </div>

                                    {/* Status Icon */}
                                    <div
                                        className={`p-1.5 rounded-lg
              ${isOver
                                                ? "bg-red-100 text-red-600"
                                                : isComplete
                                                    ? "bg-blue-100 text-blue-600"
                                                    : "bg-gray-100 text-gray-500"
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
                                                ? "text-red-600"
                                                : isComplete
                                                    ? "text-blue-600"
                                                    : "text-gray-800"
                                            }`}
                                    >
                                        {assigned}
                                        <span className="text-xs text-gray-400 font-medium ml-1">
                                            / {total}h
                                        </span>
                                    </span>

                                    {isOver && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                                            exceeded
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
