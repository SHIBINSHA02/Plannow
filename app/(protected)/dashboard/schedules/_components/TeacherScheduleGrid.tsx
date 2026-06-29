// app/(protected)/dashboard/schedules/_components/TeacherScheduleGrid.tsx
"use client";

import { useTheme } from "@/app/theme-provider"; // Imported theme hook

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    day: number;        // 1–5
    period: number;     // 1–6
    subject: string;
    className: string;
    teacherId?: string;
    organisationId: string;
};

/* ---------- Component ---------- */

export default function TeacherScheduleGrid({
    schedule,
    loading,
    teachersMap={},
}: {
    schedule: ScheduleSlot[];
    loading: boolean;
    teachersMap?: Record<string, string>;
}) {
    const { theme } = useTheme(); // Subscribed to current theme

    if (loading) {
        return (
            <div
                className={`p-6 rounded-3xl animate-pulse h-64 border transition-colors duration-200
                    ${theme === "light" ? "bg-white border-slate-100" : "bg-[#0f172a] border-slate-800"}`}
            />
        );
    }

    if (!schedule || schedule.length === 0) {
        return (
            <div className={`text-center text-xs font-light py-12 transition-colors duration-200
                ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                No schedule assigned.
            </div>
        );
    }

    /* ---------- Build grid map ---------- */
    const grid: Record<string, ScheduleSlot[]> = {};

    schedule.forEach(slot => {
        const key = `${slot.day}-${slot.period}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(slot);
    });

    const days = [1, 2, 3, 4, 5];
    const periods = [1, 2, 3, 4, 5, 6];

    /* ---------- Day labels ---------- */
    const dayLabels: Record<number, string> = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
    };

    return (
        <div
            className={`border rounded-3xl shadow-sm overflow-hidden transition-all duration-200
                ${theme === "light"
                    ? "bg-white border-slate-100 shadow-blue-500/5"
                    : "bg-[#0f172a] border-slate-800 shadow-none"}`}
        >
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                    <thead>
                        <tr className={theme === "light" ? "bg-slate-50/70" : "bg-slate-900/40"}>
                            <th className={`px-4 py-3.5 text-left font-medium border-b transition-colors duration-200
                                ${theme === "light" ? "text-slate-400 border-slate-100" : "text-slate-500 border-slate-800"}`}>
                                Day / Period
                            </th>
                            {periods.map(p => (
                                <th
                                    key={p}
                                    className={`px-4 py-3.5 text-center font-medium border-b transition-colors duration-200
                                        ${theme === "light" ? "text-slate-800 border-slate-100" : "text-slate-200 border-slate-800"}`}
                                >
                                    Period {p}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className={`divide-y transition-colors duration-200 ${theme === "light" ? "divide-slate-100" : "divide-slate-800"}`}>
                        {days.map(day => (
                            <tr
                                key={day}
                                className={`transition-colors duration-150
                                    ${theme === "light" ? "hover:bg-slate-50/40" : "hover:bg-slate-900/20"}`}
                            >
                                {/* Day Sidebar Column */}
                                <td className={`px-4 py-3.5 font-semibold transition-colors duration-200
                                    ${theme === "light" ? "text-slate-900 bg-slate-50/30" : "text-white bg-slate-900/10"}`}>
                                    {dayLabels[day]}
                                </td>

                                {/* Grid Time Slots */}
                                {periods.map(period => {
                                    const slots = grid[`${day}-${period}`] ?? [];

                                    return (
                                        <td
                                            key={period}
                                            className="p-2.5 align-top text-center min-w-[120px]"
                                        >
                                            {slots.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {slots.map((s, index) => (
                                                        <div
                                                            key={`${s.className}-${s.subject}-${index}`}
                                                            className={`p-2.5 rounded-xl border text-left transition-all duration-200
                                                                ${theme === "light"
                                                                    ? "border-blue-100 bg-blue-50/50"
                                                                    : "border-blue-950/40 bg-blue-950/20"}`}
                                                        >
                                                            <div className={`font-semibold tracking-tight ${theme === "light" ? "text-blue-700" : "text-blue-400"}`}>
                                                                {s.teacherId ? teachersMap[s.teacherId] || "Unknown Teacher" : "Unassigned Teacher"}
                                                            </div>
                                                            <div className={`mt-0.5 font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                                                                {s.subject}
                                                            </div>
                                                            <div className={`mt-0.5 font-light ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                                                {s.className}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-start pt-0.5">
                                                    <div className={`w-full py-1.5 rounded-xl border text-center font-medium tracking-wide uppercase text-[10px] transition-all duration-200
                                                        ${theme === "light"
                                                            ? "border-green-100 bg-green-50/40 text-green-600"
                                                            : "border-green-950/30 bg-green-950/10 text-green-500/90"}`}
                                                    >
                                                        Free
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}