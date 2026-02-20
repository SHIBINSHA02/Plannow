"use client";

import { SlotInfo } from "./SubstitutionWorkspace";
import { ChevronDown } from "lucide-react";

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
    const grid: ScheduleSlot[][][] = days.map(() =>
        periods.map(() => [])
    );

    for (const slot of schedule) {
        const d = slot.day - 1;
        const p = slot.period - 1;
        if (grid[d]?.[p]) {
            grid[d][p].push(slot);
        }
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
    const grid = scheduleToGrid(schedule, days, periods);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
                <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${periods.length}, 1fr)` }}>
                    {days.map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <h3 className="px-4 py-3 font-medium text-gray-800 border-b border-gray-200">
                Schedule – {className}
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-3 py-2 border-b border-r border-gray-200 text-left text-sm font-medium text-gray-600">
                                Day / Period
                            </th>
                            {periods.map((p) => (
                                <th
                                    key={p}
                                    className="px-3 py-2 border-b border-r border-gray-200 text-center text-sm font-medium text-gray-600 last:border-r-0"
                                >
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((row, dayIndex) => (
                            <tr key={dayIndex} className="hover:bg-gray-50/50">
                                <td className="px-3 py-2 border-b border-r border-gray-200 font-medium text-gray-700 text-sm bg-gray-50/80">
                                    {days[dayIndex]}
                                </td>
                                {row.map((cell, periodIndex) => (
                                    <td
                                        key={periodIndex}
                                        className="p-2 border-b border-r border-gray-200 align-top last:border-r-0 min-w-[140px]"
                                    >
                                        <div className="space-y-1">
                                            {cell.map((slot) => (
                                                <button
                                                    key={slot._id}
                                                    type="button"
                                                    onClick={() =>
                                                        onSlotClick({
                                                            slotId: slot._id,
                                                            classroomId,
                                                            className,
                                                            day: slot.day,
                                                            period: slot.period,
                                                            subject: slot.subject,
                                                            teacherId: slot.teacherId,
                                                        })
                                                    }
                                                    className="w-full text-left px-2 py-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-medium text-gray-700 truncate">
                                                            {slot.subject ?? "—"}
                                                        </span>
                                                        <ChevronDown
                                                            size={14}
                                                            className="text-gray-400 group-hover:text-blue-600 shrink-0"
                                                        />
                                                    </div>
                                                    {slot.teacherId && (
                                                        <span className="text-xs text-gray-500 block truncate mt-0.5">
                                                            {teachersMap[slot.teacherId] ?? slot.teacherId}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                            {cell.length === 0 && (
                                                <div className="w-full px-2 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 text-xs">
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
