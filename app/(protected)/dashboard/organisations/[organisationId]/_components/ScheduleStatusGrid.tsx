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
                <div className="lg:col-span-3 p-6 bg-linear-to-br from-blue-700 via-blue-600 to-blue-700 rounded-3xl shadow-2xl shadow-blue-900/20 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {subjectsConfig.map((subject, index) => {
                        const assigned = assignedHours[subject.subject] || 0;
                        const total = subject.weeklyHours;
                        const percentage = Math.min(Math.round((assigned / total) * 100), 100);
                        const isComplete = assigned === total;
                        const isOver = assigned > total;
                        const isUnder = assigned < total && assigned > 0;
                        const isEmpty = assigned === 0;

                        return (
                            <motion.div
                                key={subject.subject}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative group p-5 rounded-2xl border transition-all duration-300 ${isOver ? "bg-red-50/30 border-red-100 scale-[1.02] shadow-lg shadow-red-900/5" :
                                        isComplete ? "bg-blue-50/30 border-blue-100 shadow-md" :
                                            "bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {subject.subject}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                            <Clock className="w-3 h-3" />
                                            Target: {total}h
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-center p-2 rounded-xl ${isOver ? "bg-red-500 text-white shadow-lg shadow-red-500/30" :
                                            isComplete ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" :
                                                isUnder ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" :
                                                    "bg-gray-100 text-gray-400"
                                        }`}>
                                        {isComplete && !isOver ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : isOver ? (
                                            <AlertCircle className="w-5 h-5" />
                                        ) : (
                                            <span className="text-[10px] font-black uppercase">{percentage}%</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className={`text-xl font-black ${isOver ? "text-red-600" :
                                                    isComplete ? "text-blue-600" :
                                                        "text-gray-800"
                                                }`}>
                                                {assigned} <span className="text-xs text-gray-400 font-bold uppercase ml-0.5">/ {total}h</span>
                                            </span>
                                        </div>
                                        {isOver && (
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter"
                                            >
                                                Exceeded
                                            </motion.span>
                                        )}
                                    </div>

                                    <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                                            transition={{ duration: 0.8, ease: "circOut" }}
                                            className={`h-full rounded-full ${isOver ? "bg-red-500" :
                                                    isComplete ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" :
                                                        "bg-blue-500"
                                                }`}
                                        />
                                        {percentage > 100 && (
                                            <div className="absolute top-0 right-0 h-full w-[2px] bg-red-700"></div>
                                        )}
                                    </div>
                                </div>

                                {isComplete && !isOver && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ScheduleStatusGrid;
