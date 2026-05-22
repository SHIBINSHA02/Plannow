"use client";

import { SlotInfo } from "./SubstitutionWorkspace";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject?: string;
    teacherId?: string;
};

type Props = {
    schedule: ScheduleSlot[];
    days: string[];
    periods: string[];
    className: string;
    classroomId: string;
    onSlotClick: (slot: SlotInfo) => void;
    loading?: boolean;
    teachersMap?: Record<string, string>;
};

function scheduleToGrid(schedule: ScheduleSlot[], days: string[], periods: string[]) {
    const grid: ScheduleSlot[][][] = days.map(() => periods.map(() => []));
    for (const slot of schedule) {
        const d = slot.day - 1;
        const p = slot.period - 1;
        if (grid[d]?.[p]) grid[d][p].push(slot);
    }
    return grid;
}

export default function SubstitutionScheduleGrid({
    schedule,
    days,
    periods,
    className,
    classroomId,
    onSlotClick,
    loading,
    teachersMap = {},
}: Props) {
    const { theme } = useTheme();
    const grid = scheduleToGrid(schedule, days, periods);
    const isLight = theme === "light";

    if (loading) {
        return (
            <div className={`rounded-2xl border p-6 animate-pulse ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>
                <div className={`h-8 w-48 rounded mb-4 ${isLight ? "bg-slate-100" : "bg-slate-800"}`} />
                <div className="grid gap-2">
                    {days.map((_, i) => (
                        <div key={i} className={`h-16 rounded ${isLight ? "bg-slate-100" : "bg-slate-800"}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-colors ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"
            }`}>
            <h3 className={`px-5 py-4 font-medium border-b ${isLight ? "text-slate-800 border-slate-200" : "text-slate-200 border-slate-800"}`}>
                Schedule – {className}
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className={isLight ? "bg-slate-50" : "bg-slate-900/50"}>
                            <th className={`px-4 py-3 border-b border-r text-left text-sm font-medium ${isLight ? "border-slate-200 text-slate-600" : "border-slate-800 text-slate-400"}`}>
                                Day / Period
                            </th>
                            {periods.map((p) => (
                                <th key={p} className={`px-4 py-3 border-b border-r text-center text-sm font-medium ${isLight ? "border-slate-200 text-slate-600" : "border-slate-800 text-slate-400"} last:border-r-0`}>
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((row, dayIndex) => (
                            <tr key={dayIndex} className={`transition-colors ${isLight ? "hover:bg-slate-50/50" : "hover:bg-slate-800/20"}`}>
                                <td className={`px-4 py-3 border-b border-r font-medium text-sm ${isLight ? "border-slate-200 text-slate-700 bg-slate-50/80" : "border-slate-800 text-slate-300 bg-slate-900/30"}`}>
                                    {days[dayIndex]}
                                </td>
                                {row.map((cell, periodIndex) => (
                                    <td key={periodIndex} className={`p-2 border-b border-r align-top last:border-r-0 min-w-[140px] ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                                        <div className="space-y-1">
                                            {cell.map((slot) => (
                                                <button
                                                    key={slot._id}
                                                    type="button"
                                                    onClick={() => onSlotClick({ slotId: slot._id, classroomId, className, day: slot.day, period: slot.period, subject: slot.subject, teacherId: slot.teacherId })}
                                                    className={`w-full text-left px-3 py-2 rounded-xl border transition-all group ${isLight
                                                            ? "bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200"
                                                            : "bg-[#1e293b] border-slate-700 hover:bg-blue-950/30 hover:border-blue-900"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className={`text-xs font-medium truncate ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                                                            {slot.subject ?? "—"}
                                                        </span>
                                                        <ChevronDown size={14} className={`shrink-0 ${isLight ? "text-slate-400 group-hover:text-blue-600" : "text-slate-500 group-hover:text-blue-400"}`} />
                                                    </div>
                                                    {slot.teacherId && (
                                                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                                            {teachersMap[slot.teacherId] ?? slot.teacherId}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                            {cell.length === 0 && (
                                                <div className={`w-full px-3 py-2 rounded-xl border border-dashed text-xs ${isLight ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-600"}`}>
                                                    —
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}