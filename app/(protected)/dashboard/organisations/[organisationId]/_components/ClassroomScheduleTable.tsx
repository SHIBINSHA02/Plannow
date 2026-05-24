// app/(protected)/dashboard/organisations/[organisationId]/_components/ClassroomScheduleTable.tsx
"use client";

/* cspell:disable-next-line */
// cspell:ignore Organisations Organisation

import React, { useMemo } from "react";
import { useScheduleGrid } from "./../../../context/ScheduleGridContext";
import { useTheme } from "@/app/theme-provider";

// --- TYPES FOR PROP ENFORCEMENT ---
interface SlotItem {
    _id?: string;
    teacherId?: string;
    subject?: string;
    status?: "idle" | "saving" | "saved" | "error";
}

interface ScheduleSlotProps {
    slot: SlotItem;
    idx: number;
    dayIndex: number;
    periodIndex: number;
}

// --- OPTIMIZED SUB-COMPONENT ---
const ScheduleSlot: React.FC<ScheduleSlotProps> = React.memo(({ slot, idx, dayIndex, periodIndex }) => {
    const {
        teachers,
        subjects,
        remainingHours,
        updateAssignment,
        deleteAssignment,
        saveSlot,
        allOrganisationAssignments,
        allowParallelAssignments,
    } = useScheduleGrid();

    const { theme } = useTheme();
    const isDark = theme === "dark";

    // 1. Memoize teacher calculations
    const availableTeachers = useMemo(() => {
        let list = slot.subject
            ? teachers.filter((t) => t.subjects.includes(slot.subject!))
            : teachers.filter((t) => t.subjects.some((s) => (remainingHours[s] ?? 0) > 0));

        if (!allowParallelAssignments) {
            list = list.filter((t) => {
                return !allOrganisationAssignments.some((a) =>
                    a.day === dayIndex + 1 &&
                    a.period === periodIndex + 1 &&
                    a.teacherId === t.teacherId &&
                    a._id !== slot._id
                );
            });
        }

        if (slot.teacherId && !list.some((t) => t.teacherId === slot.teacherId)) {
            const currentTeacher = teachers.find((t) => t.teacherId === slot.teacherId);
            if (currentTeacher) {
                list = [...list, currentTeacher];
            }
        }

        return list;
    }, [slot.subject, slot.teacherId, slot._id, teachers, remainingHours, allowParallelAssignments, allOrganisationAssignments, dayIndex, periodIndex]);

    // 2. Memoize subject calculations
    const availableSubjects = useMemo(() => {
        const initialSubjects = slot.teacherId
            ? teachers.find((t) => t.teacherId === slot.teacherId)?.subjects || []
            : subjects;

        return initialSubjects.filter((s) => {
            const remaining = remainingHours[s] ?? 0;
            const isSelected = slot.subject === s;
            if (remaining <= 0 && !isSelected) return false;

            return teachers.some((t) => {
                if (!t.subjects.includes(s)) return false;
                if (allowParallelAssignments) return true;

                return !allOrganisationAssignments.some((a) =>
                    a.day === dayIndex + 1 &&
                    a.period === periodIndex + 1 &&
                    a.teacherId === t.teacherId &&
                    a._id !== slot._id
                );
            });
        });
    }, [slot.teacherId, slot.subject, slot._id, teachers, subjects, remainingHours, allowParallelAssignments, allOrganisationAssignments, dayIndex, periodIndex]);

    // Dynamic slot container styles matching state status to light/dark balance
    const containerClasses = useMemo(() => {
        const base = "p-2 rounded border transition-all duration-300 ";
        if (slot.status === "saving") {
            return base + (isDark ? "bg-blue-950/40 border-blue-800 text-blue-300 animate-pulse" : "bg-blue-50 border-blue-200 animate-pulse");
        }
        if (slot.status === "saved") {
            return base + (isDark ? "bg-green-950/30 border-green-800 text-green-300 shadow-inner" : "bg-green-50 border-green-200 shadow-inner");
        }
        if (slot.status === "error") {
            return base + (isDark ? "bg-red-950/30 border-red-900 text-red-300" : "bg-red-50 border-red-200");
        }
        return base + (isDark ? "bg-slate-800/80 border-slate-700 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-900");
    }, [slot.status, isDark]);

    return (
        <div className={containerClasses}>
            {slot.status === "saving" && (
                <div className={`text-[10px] font-medium mb-1 ${isDark ? "text-blue-400" : "text-blue-500"}`}>Saving...</div>
            )}
            {slot.status === "error" && (
                <div className={`text-[10px] font-medium mb-1 ${isDark ? "text-red-400" : "text-red-500"}`}>Error saving!</div>
            )}

            {/* Teacher Dropdown */}
            <select
                value={slot.teacherId || ""}
                onChange={(e) => {
                    const targetTeacherId = e.target.value;
                    let calculatedSubject = slot.subject || "";

                    updateAssignment(dayIndex, periodIndex, idx, "teacherId", targetTeacherId);

                    if (targetTeacherId) {
                        const selectedTeacher = teachers.find((t) => t.teacherId === targetTeacherId);
                        if (selectedTeacher && selectedTeacher.subjects.length === 1) {
                            calculatedSubject = selectedTeacher.subjects[0];
                            updateAssignment(dayIndex, periodIndex, idx, "subject", calculatedSubject);
                        }
                    }

                    saveSlot(dayIndex, periodIndex, idx, {
                        ...slot,
                        teacherId: targetTeacherId,
                        subject: calculatedSubject,
                    });
                }}
                className={`w-full px-2 py-1 mb-1 text-xs border rounded focus:outline-blue-500 transition-colors
                    ${isDark
                        ? "bg-slate-900 border-slate-700 text-slate-200 focus:bg-slate-950"
                        : "bg-white border-gray-300 text-gray-900"}`}
            >
                <option value="">Select Teacher</option>
                {availableTeachers.map((t) => (
                    <option key={t.teacherId} value={t.teacherId}>
                        {t.teacherName}
                    </option>
                ))}
            </select>

            {/* Subject Dropdown */}
            <select
                value={slot.subject || ""}
                onChange={(e) => {
                    const targetSubject = e.target.value;
                    let calculatedTeacherId = slot.teacherId || "";

                    updateAssignment(dayIndex, periodIndex, idx, "subject", targetSubject);

                    if (targetSubject) {
                        const potentialTeachers = teachers.filter((t) => t.subjects.includes(targetSubject));
                        if (potentialTeachers.length === 1) {
                            calculatedTeacherId = potentialTeachers[0].teacherId;
                            updateAssignment(dayIndex, periodIndex, idx, "teacherId", calculatedTeacherId);
                        }
                    }

                    saveSlot(dayIndex, periodIndex, idx, {
                        ...slot,
                        subject: targetSubject,
                        teacherId: calculatedTeacherId,
                    });
                }}
                className={`w-full px-2 py-1 text-xs border rounded focus:outline-blue-500 transition-colors
                    ${isDark
                        ? "bg-slate-900 border-slate-700 text-slate-200 focus:bg-slate-950"
                        : "bg-white border-gray-300 text-gray-900"}`}
            >
                <option value="">Select Subject</option>
                {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>

            {/* Delete Action */}
            <button
                type="button"
                onClick={() => deleteAssignment(dayIndex, periodIndex, idx)}
                className={`w-full mt-2 px-2 py-1 text-xs font-medium border rounded transition-colors
                    ${isDark
                        ? "text-red-400 bg-red-950/40 border-red-900/50 hover:bg-red-900/40"
                        : "text-red-700 bg-red-100 border-red-300 hover:bg-red-200"}`}
            >
                Delete
            </button>
        </div>
    );
});

ScheduleSlot.displayName = "ScheduleSlot";


// --- MAIN TABLE COMPONENT ---
const ClassroomScheduleTable: React.FC = () => {
    const { grid, days, periods, addAssignment } = useScheduleGrid();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`relative overflow-x-auto rounded-xl shadow-lg transition-all duration-200
            ${isDark ? "shadow-slate-950/40 border border-slate-800" : "shadow-blue-800/20 border border-gray-300"}`}>
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className={`px-4 py-3 border font-semibold text-white tracking-wide text-sm
                            ${isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-blue-700"}`}>
                            Day / Period
                        </th>
                        {periods.map((p) => (
                            <th
                                key={p}
                                className={`px-4 py-3 border font-semibold text-center text-white tracking-wide text-sm
                                    ${isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-blue-700"}`}
                            >
                                {p}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className={isDark ? "bg-slate-900/50" : "bg-white"}>
                    {grid.map((row, dayIndex) => {
                        // Alternate row backgrounds smoothly for scannability
                        const rowBackground = dayIndex % 2 !== 0
                            ? (isDark ? "bg-slate-800/40" : "bg-blue-50/50")
                            : "";

                        return (
                            <tr key={dayIndex} className={`${rowBackground} transition-colors duration-150`}>
                                <td className={`px-4 py-2 border text-center text-white font-semibold text-sm
                                    ${isDark ? "border-slate-800 bg-slate-900/80" : "border-gray-200 bg-blue-700"}`}>
                                    {days[dayIndex]}
                                </td>

                                {row.map((cell, periodIndex) => (
                                    <td
                                        key={periodIndex}
                                        className={`p-2 min-w-[180px] border align-top transition-colors
                                            ${isDark ? "border-slate-800" : "border-gray-200"}`}
                                    >
                                        <div className="space-y-2">
                                            {cell.map((slot, idx) => {
                                                const slotKey = slot._id ?? `slot-${dayIndex}-${periodIndex}-${idx}`;
                                                return (
                                                    <ScheduleSlot
                                                        key={slotKey}
                                                        slot={slot}
                                                        idx={idx}
                                                        dayIndex={dayIndex}
                                                        periodIndex={periodIndex}
                                                    />
                                                );
                                            })}

                                            {/* Add Assignment Button */}
                                            <button
                                                type="button"
                                                onClick={() => addAssignment(dayIndex, periodIndex)}
                                                className={`w-full px-2 py-1.5 text-xs font-medium border rounded transition-colors
                                                    ${isDark
                                                        ? "text-green-400 bg-green-950/30 border-green-900/50 hover:bg-green-900/40"
                                                        : "text-green-700 bg-green-100 border-green-300 hover:bg-green-200"}`}
                                            >
                                                + Add Assignment
                                            </button>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ClassroomScheduleTable;