"use client";

import { useTheme } from "@/app/theme-provider";
import { Calendar } from "lucide-react";

interface TimetableWrapperProps {
    DAYS: number[];
    PERIODS: number[];
    DAY_MAP: Record<number, string>;
    serializedSchedule: Record<string, any[]>;
}

export default function TimetableWrapper({
    DAYS,
    PERIODS,
    DAY_MAP,
    serializedSchedule,
}: TimetableWrapperProps) {
    const { theme } = useTheme();

    return (
        <div
            className={`border rounded-xl shadow-sm overflow-hidden transition-colors duration-300
            ${theme === "light"
                    ? "bg-white border-gray-200 shadow-blue-700/5"
                    : "bg-[#0d1527] border-gray-800 shadow-none"}
        `}
        >
            {/* Header */}
            <div
                className={`px-6 py-4 border-b transition-colors duration-300
                ${theme === "light" ? "border-gray-200" : "border-gray-800"}
            `}
            >
                <h2
                    className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-300
                    ${theme === "light" ? "text-gray-900" : "text-gray-100"}
                `}
                >
                    <Calendar
                        className={`size-5 transition-colors duration-300
                        ${theme === "light" ? "text-gray-500" : "text-gray-400"}
                    `}
                    />
                    Weekly Schedule
                </h2>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr
                            className={`transition-colors duration-300
                            ${theme === "light" ? "bg-blue-600" : "bg-blue-950"}
                        `}
                        >
                            <th
                                className={`w-32 px-6 py-4 text-left font-medium text-white border-b border-r transition-colors duration-300
                                ${theme === "light" ? "border-gray-200" : "border-gray-800"}
                            `}
                            >
                                Day
                            </th>
                            {PERIODS.map((p) => (
                                <th
                                    key={p}
                                    className={`px-4 py-4 text-center font-medium text-white border-b border-r transition-colors duration-300
                                    ${theme === "light" ? "border-gray-200" : "border-gray-800"}
                                `}
                                >
                                    P{p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map((day) => (
                            <tr
                                key={day}
                                className={`border-b transition-colors duration-300
                                ${theme === "light"
                                        ? "border-gray-200 hover:bg-gray-50/80"
                                        : "border-gray-800 hover:bg-[#141f36]"}
                            `}
                            >
                                {/* Day Column */}
                                <td
                                    className={`px-6 py-5 font-medium border-r transition-colors duration-300
                                    ${theme === "light"
                                            ? "text-gray-800 border-gray-200 bg-gray-50/50"
                                            : "text-gray-200 border-gray-800 bg-[#090f1c]"}
                                `}
                                >
                                    {DAY_MAP[day]}
                                </td>

                                {/* Slots Columns */}
                                {PERIODS.map((period) => {
                                    const slots = serializedSchedule[`${day}-${period}`] || [];
                                    return (
                                        <td
                                            key={period}
                                            className={`px-3 py-4 border-r align-top min-w-[120px] transition-colors duration-300
                                            ${theme === "light" ? "border-gray-200" : "border-gray-800"}
                                        `}
                                        >
                                            {slots.length > 0 ? (
                                                <div className="space-y-2">
                                                    {slots.map((slot, i) => (
                                                        <div
                                                            key={i}
                                                            className={`border rounded px-3 py-2 transition-colors duration-300
                                                            ${theme === "light"
                                                                    ? "border-gray-200 bg-white text-gray-900 shadow-sm"
                                                                    : "border-gray-700 bg-[#16223f] text-gray-100"}
                                                        `}
                                                        >
                                                            <div className="font-semibold text-sm truncate">
                                                                {slot.subject || "—"}
                                                            </div>
                                                            <div
                                                                className={`text-xs mt-0.5 transition-colors duration-300
                                                                ${theme === "light" ? "text-gray-500" : "text-gray-400"}
                                                            `}
                                                            >
                                                                {slot.className}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div
                                                    className={`h-full min-h-[3.5rem] flex items-center justify-center text-sm italic transition-colors duration-300
                                                    ${theme === "light" ? "text-gray-300" : "text-gray-600"}
                                                `}
                                                >
                                                    Free
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