"use client";

import { ChevronDown, User } from "lucide-react";

type ScheduleSlot = {
    _id: string;
    day: number;        // 1–5
    period: number;     // 1–6
    subject: string;
    className: string;
    organisationId: string;
    teacherId?: string;
};

type Props = {
    schedule: ScheduleSlot[];
    loading: boolean;
    teachersMap: Record<string, string>;
};

export default function ClassroomScheduleGrid({
    schedule,
    loading,
    teachersMap,
}: Props) {
    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-64 bg-gray-50 rounded-xl" />
            </div>
        );
    }

    if (!schedule || schedule.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                <p className="text-sm text-gray-400 font-medium">No schedule assigned to this classroom.</p>
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

    const dayLabels: Record<number, string> = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
    };

    return (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm lg:hide-scrollbar">
            <table className="min-w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="px-4 py-3 text-left font-medium uppercase tracking-wider border-r border-blue-500 w-32">
                            Day / Period
                        </th>
                        {periods.map(p => (
                            <th
                                key={p}
                                className="px-4 py-3 text-center font-medium uppercase tracking-wider border-r border-blue-500 last:border-r-0"
                            >
                                Period {p}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {days.map(day => (
                        <tr key={day} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-4 font-semibold text-blue-700 bg-blue-50/30 border-r border-gray-100 uppercase tracking-tighter">
                                {dayLabels[day]}
                            </td>

                            {periods.map(period => {
                                const slots = grid[`${day}-${period}`] ?? [];

                                return (
                                    <td
                                        key={period}
                                        className="p-3 align-top border-r border-gray-100 last:border-r-0 min-w-[140px]"
                                    >
                                        {slots.length > 0 ? (
                                            <div className="space-y-2">
                                                {slots.map((s, index) => (
                                                    <div
                                                        key={`${s._id}-${index}`}
                                                        className="bg-white border border-blue-100 p-2 rounded-lg shadow-sm"
                                                    >
                                                        <div className="font-semibold text-blue-900 mb-1">
                                                            {s.subject}
                                                        </div>
                                                        {s.teacherId && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                                                <User className="w-3 h-3 text-blue-400" />
                                                                <span className="truncate">{teachersMap[s.teacherId] || "Unknown"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="px-3 py-1 bg-green-50 text-green-600 rounded text-[10px] font-semibold uppercase tracking-widest border border-green-100/50">
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
    );
}
