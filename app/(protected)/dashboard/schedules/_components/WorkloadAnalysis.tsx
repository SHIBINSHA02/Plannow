"use client";

import { useTheme } from "@/app/theme-provider";

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    classroomId: string;
    organisationId: string;
};

type Props = {
    schedule: ScheduleSlot[];
};

/* ---------- Helpers ---------- */

const dayLabels: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
};

/* ---------- Component ---------- */

export default function WorkloadAnalysis({ schedule }: Props) {
    const { theme } = useTheme();

    const workloadByDay: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    schedule.forEach(slot => {
        if (workloadByDay[slot.day] !== undefined) workloadByDay[slot.day]++;
    });

    const maxLoad = Math.max(...Object.values(workloadByDay), 1);
    const jsDay = new Date().getDay();
    const today = jsDay >= 1 && jsDay <= 5 ? jsDay : null;
    const todayLoad = today ? workloadByDay[today] : 0;

    // Theme helpers
    const textPrimary = theme === "light" ? "text-gray-800" : "text-white";
    const textSecondary = theme === "light" ? "text-gray-500" : "text-slate-400";
    const bgMuted = theme === "light" ? "bg-gray-50" : "bg-slate-800/50";
    const barBg = theme === "light" ? "bg-gray-100/80" : "bg-slate-800";

    return (
        <div className="space-y-6">
            {/* ---------- Overall Workload ---------- */}
            <div className="space-y-5">
                {Object.entries(workloadByDay).map(([day, count]) => (
                    <div key={day} className="group cursor-default">
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className={`font-semibold transition-colors ${theme === "light" ? "text-gray-700 group-hover:text-blue-700" : "text-slate-300 group-hover:text-blue-400"}`}>
                                {dayLabels[Number(day)]}
                            </span>
                            <span className={`font-medium px-2 py-0.5 rounded text-xs border transition-colors ${theme === "light"
                                    ? "bg-gray-50 text-gray-500 border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100"
                                    : "bg-slate-900 text-slate-400 border-slate-700 group-hover:bg-blue-950 group-hover:text-blue-300 group-hover:border-blue-900"
                                }`}>
                                {count} classes
                            </span>
                        </div>

                        <div className={`w-full ${barBg} rounded-full h-2.5 overflow-hidden`}>
                            <div
                                className="bg-blue-500 hover:bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${(count / maxLoad) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------- Today's Workload ---------- */}
            <div className={`border rounded-xl p-5 shadow-sm mt-6 ${theme === "light"
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                    : "bg-slate-900/50 border-slate-800"
                }`}>
                <h3 className={`text-xs font-bold mb-4 uppercase tracking-wider ${theme === "light" ? "text-blue-900" : "text-blue-400"}`}>
                    Today's Capacity
                </h3>

                {today ? (
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center border-2 shrink-0 ${theme === "light" ? "bg-white border-blue-200" : "bg-slate-800 border-slate-700"
                            }`}>
                            <div className={`text-2xl font-black ${theme === "light" ? "text-blue-700" : "text-blue-400"}`}>
                                {todayLoad}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-1">
                                <div className={`font-bold ${textPrimary}`}>
                                    {dayLabels[today]}
                                </div>
                                <div className={`text-xs font-bold px-2 py-0.5 rounded-md ${theme === "light" ? "text-blue-600 bg-blue-100/50" : "text-blue-400 bg-blue-950/50"
                                    }`}>
                                    {Math.round((todayLoad / 6) * 100)}% Booked
                                </div>
                            </div>
                            <div className={`rounded-full h-3 border overflow-hidden shadow-inner ${theme === "light" ? "bg-white/60 border-blue-100/50" : "bg-slate-800 border-slate-700"
                                }`}>
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${(todayLoad / 6) * 100}%` }}
                                />
                            </div>
                            <div className={`text-xs mt-2 font-medium ${textSecondary}`}>
                                Based on a maximum of 6 periods per day
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${theme === "light" ? "text-blue-800/80 bg-white/60 border-blue-100/50" : "text-blue-300 bg-slate-800 border-slate-700"
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-medium text-sm">No scheduled classes today. Enjoy your weekend!</span>
                    </div>
                )}
            </div>
        </div>
    );
}