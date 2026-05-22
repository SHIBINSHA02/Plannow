"use client";

import { useMemo } from "react";
import { useTheme } from "@/app/theme-provider";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    organisationId: string;
};

export default function TodaysClasses({ schedule }: { schedule: ScheduleSlot[] }) {
    const { theme } = useTheme();

    const { displayDay, isWeekend, todaysClasses, currentPeriod } = useMemo(() => {
        const now = new Date();
        const today = now.getDay();
        const isWeekendMode = today === 0 || today === 6;
        const targetDay = isWeekendMode ? 1 : today;

        const filtered = schedule
            .filter(s => s.day === targetDay)
            .sort((a, b) => a.period - b.period);

        const hour = now.getHours();
        let estimatedPeriod = -1;
        if (!isWeekendMode && hour >= 8 && hour <= 14) {
            estimatedPeriod = hour - 7;
        }

        return { displayDay: targetDay, isWeekend: isWeekendMode, todaysClasses: filtered, currentPeriod: estimatedPeriod };
    }, [schedule]);

    const dayLabels: Record<number, string> = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"
    };

    if (!schedule || schedule.length === 0) return null;

    // Helper classes
    const cardBase = `p-6 rounded-2xl shadow-sm border h-full ${theme === "light" ? "bg-white border-gray-100" : "bg-[#0f172a] border-slate-800"
        }`;
    const textColor = theme === "light" ? "text-gray-900" : "text-white";
    const subTextColor = theme === "light" ? "text-gray-500" : "text-slate-400";

    return (
        <div className={cardBase}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-xl font-bold ${textColor}`}>
                        {isWeekend ? `Next Monday` : `Today's Classes`}
                    </h3>
                    <p className={`text-sm mt-1 ${subTextColor}`}>{dayLabels[displayDay]}</p>
                </div>
                <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full border ${theme === "light" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-blue-950/40 text-blue-400 border-blue-900/50"
                    }`}>
                    {todaysClasses.length} Classes
                </span>
            </div>

            {todaysClasses.length > 0 ? (
                <div className="space-y-4">
                    {todaysClasses.map((cls, idx) => {
                        const isCurrent = cls.period === currentPeriod;
                        return (
                            <div
                                key={cls._id || idx}
                                className={`flex items-center p-4 rounded-xl border transition-all ${isCurrent
                                        ? theme === "light"
                                            ? "bg-blue-50 border-blue-300 shadow-md"
                                            : "bg-blue-950/20 border-blue-800 shadow-none"
                                        : theme === "light"
                                            ? "bg-white border-gray-100 hover:border-blue-200"
                                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                    }`}
                            >
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold mr-5 shrink-0 shadow-sm ${isCurrent
                                        ? "bg-blue-600 text-white"
                                        : theme === "light" ? "bg-gray-100 text-gray-700" : "bg-slate-800 text-slate-300"
                                    }`}>
                                    <span className="text-[10px] uppercase font-semibold opacity-80 tracking-wider">Per</span>
                                    <span className="text-xl leading-none mt-0.5">{cls.period}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-bold text-lg ${isCurrent ? (theme === "light" ? "text-blue-900" : "text-blue-300") : textColor}`}>
                                            {cls.subject}
                                        </h4>
                                        {isCurrent && (
                                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Now
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center text-sm font-medium w-fit px-2 py-1 rounded ${theme === "light" ? "text-gray-600 bg-gray-50" : "text-slate-400 bg-slate-800/50"
                                        }`}>
                                        Class: <span className={theme === "light" ? "text-gray-900 ml-1" : "text-slate-200 ml-1"}>{cls.className}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed h-64 ${theme === "light" ? "bg-gray-50 border-gray-300" : "bg-slate-900/30 border-slate-700"
                    }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === "light" ? "bg-blue-50 text-blue-500" : "bg-blue-900/20 text-blue-400"}`}>
                        {/* Simplified SVG for brevity */}
                        <span className="text-2xl">☕</span>
                    </div>
                    <p className={`font-medium text-lg ${textColor}`}>No classes scheduled</p>
                    <p className={`text-sm mt-2 max-w-[200px] ${subTextColor}`}>You have a free day. Take some time to relax!</p>
                </div>
            )}
        </div>
    );
}