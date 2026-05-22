"use client";

import { useTheme } from "@/app/theme-provider";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    organisationId: string;
};

export default function StatsOverview({ schedule }: { schedule: ScheduleSlot[] }) {
    const { theme } = useTheme();

    if (!schedule || schedule.length === 0) return null;

    const totalClasses = schedule.length;
    const uniqueSubjects = new Set(schedule.map(s => s.subject)).size;
    const uniqueClasses = new Set(schedule.map(s => s.className)).size;

    const dayCounts: Record<number, number> = {};
    schedule.forEach(s => {
        dayCounts[s.day] = (dayCounts[s.day] || 0) + 1;
    });

    let busiestDay = 1;
    let maxClasses = 0;
    Object.entries(dayCounts).forEach(([dayStr, count]) => {
        const day = Number(dayStr);
        if (count > maxClasses) {
            maxClasses = count;
            busiestDay = day;
        }
    });

    const dayLabels: Record<number, string> = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"
    };

    // Helper classes to make the code cleaner
    const cardBase = `p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${theme === "light"
        ? "bg-white border-gray-100"
        : "bg-[#0f172a] border-slate-800"
        }`;

    const textPrimary = theme === "light" ? "text-blue-700" : "text-blue-400";
    const textSecondary = theme === "light" ? "text-gray-500" : "text-slate-400";
    const progressBg = theme === "light" ? "bg-blue-50" : "bg-slate-800";
    const progressBar = "bg-blue-500";

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Classes */}
            <div className={cardBase}>
                <span className={`text-sm font-medium mb-1 block ${textSecondary}`}>Total Weekly Classes</span>
                <span className={`text-3xl font-bold ${textPrimary}`}>{totalClasses}</span>
                <div className={`mt-2 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                    <div className={`h-full ${progressBar} w-full`}></div>
                </div>
            </div>

            {/* Subjects */}
            <div className={cardBase}>
                <span className={`text-sm font-medium mb-1 block ${textSecondary}`}>Subjects Taught</span>
                <span className={`text-3xl font-bold ${textPrimary}`}>{uniqueSubjects}</span>
                <div className={`mt-2 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                    <div className={`h-full ${progressBar}`} style={{ width: '70%' }}></div>
                </div>
            </div>

            {/* Classes */}
            <div className={cardBase}>
                <span className={`text-sm font-medium mb-1 block ${textSecondary}`}>Distinct Classes</span>
                <span className={`text-3xl font-bold ${textPrimary}`}>{uniqueClasses}</span>
                <div className={`mt-2 h-1 w-full ${progressBg} rounded-full overflow-hidden`}>
                    <div className={`h-full ${progressBar}`} style={{ width: '85%' }}></div>
                </div>
            </div>

            {/* Busiest Day */}
            <div className={cardBase}>
                <span className={`text-sm font-medium mb-1 block ${textSecondary}`}>Busiest Day</span>
                <span className={`text-3xl font-bold ${textPrimary} truncate`}>{dayLabels[busiestDay] || "N/A"}</span>
                <span className={`text-xs font-medium mt-2 self-start px-2 py-1 rounded-md block ${theme === "light" ? "bg-blue-50 text-blue-600" : "bg-blue-950/40 text-blue-400"
                    }`}>
                    {maxClasses} classes
                </span>
            </div>
        </div>
    );
}