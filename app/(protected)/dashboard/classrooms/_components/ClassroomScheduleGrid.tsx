"use client";

import { User } from "lucide-react";
import { useTheme } from "@/app/theme-provider"; // Ensure this path is correct

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
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

export default function ClassroomScheduleGrid({ schedule, loading, teachersMap }: Props) {
    const { theme } = useTheme();

    if (loading) {
        return (
            <div className={`space-y-4 animate-pulse ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <div className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!schedule || schedule.length === 0) {
        return (
            <div className={`p-8 text-center border border-dashed rounded-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/30'}`}>
                <p className="text-sm text-gray-400 font-medium">No schedule assigned to this classroom.</p>
            </div>
        );
    }

    const grid: Record<string, ScheduleSlot[]> = {};
    schedule.forEach(slot => {
        const key = `${slot.day}-${slot.period}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(slot);
    });

    const days = [1, 2, 3, 4, 5];
    const periods = [1, 2, 3, 4, 5, 6];
    const dayLabels: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri" };

    return (
        <div className={`overflow-x-auto border rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <table className="min-w-full border-collapse text-xs">
                <thead>
                    <tr className={theme === 'dark' ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-600 text-white'}>
                        <th className="px-4 py-3 text-left font-medium uppercase tracking-wider border-r border-blue-500/30 w-32">Day / Period</th>
                        {periods.map(p => (
                            <th key={p} className="px-4 py-3 text-center font-medium uppercase tracking-wider border-r border-blue-500/30 last:border-r-0">Period {p}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
                    {days.map(day => (
                        <tr key={day} className={`group ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                            <td className={`px-4 py-4 font-semibold border-r ${theme === 'dark' ? 'text-blue-400 bg-blue-900/10 border-slate-800' : 'text-blue-700 bg-blue-50/30 border-gray-100'}`}>
                                {dayLabels[day]}
                            </td>
                            {periods.map(period => {
                                const slots = grid[`${day}-${period}`] ?? [];
                                return (
                                    <td key={period} className={`p-3 align-top border-r last:border-r-0 min-w-[140px] ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                                        {slots.length > 0 ? (
                                            <div className="space-y-2">
                                                {slots.map((s, index) => (
                                                    <div key={`${s._id}-${index}`} className={`p-2 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'}`}>
                                                        <div className={`font-semibold mb-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>{s.subject}</div>
                                                        {s.teacherId && (
                                                            <div className={`flex items-center gap-1.5 text-[10px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                <User className="w-3 h-3 text-blue-500" />
                                                                <span className="truncate">{teachersMap[s.teacherId] || "Unknown"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <div className={`px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-widest border ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-green-50 text-green-600 border-green-100/50'}`}>
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