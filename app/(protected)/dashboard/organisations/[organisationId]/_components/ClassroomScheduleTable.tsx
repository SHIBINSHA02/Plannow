"use client";

import React from "react";

/* ---------- Types ---------- */

type Teacher = {
    teacherId: string;
    teacherName: string;
};

type Assignment = {
    teacherId: string;
    subject: string;
};

type Props = {
    grid: Assignment[][][];
    days: string[];
    periods: string[];
    teachers: Teacher[];
    subjects: string[];
    addAssignment: (day: number, period: number) => void;
    updateAssignment: (
        day: number,
        period: number,
        index: number,
        field: keyof Assignment,
        value: string
    ) => void;
    deleteAssignment: (
        day: number,
        period: number,
        index: number
    ) => void;
};

/* ---------- Component ---------- */

const ClassroomScheduleTable: React.FC<Props> = ({
    grid,
    days,
    periods,
    teachers,
    subjects,
    addAssignment,
    updateAssignment,
    deleteAssignment,
}) => {
    return (
        <div className="relative overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border  border-gray-200">Day / Period</th>
                        {periods.map((p, i) => (
                            <th key={i} className="px-4 py-2 text-center border  border-gray-200">
                                {p}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {grid.map((row, dayIndex) => (
                        <tr key={dayIndex}>
                            <td className="px-4 py-2 border  border-gray-200 font-semibold bg-gray-50">
                                {days[dayIndex]}
                            </td>

                            {row.map((cell, periodIndex) => (
                                <td
                                    key={periodIndex}
                                    className="p-2 min-w-[170px] border border-gray-200"
                                >
                                    <div className="space-y-2">
                                        {cell.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2  rounded bg-gray-50"
                                            >
                                                {/* Teacher */}
                                                <select
                                                    value={slot.teacherId}
                                                    onChange={(e) =>
                                                        updateAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx,
                                                            "teacherId",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 mb-1 text-xs border border-gray-200 rounded"
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {teachers.map((t) => (
                                                        <option
                                                            key={t.teacherId}
                                                            value={t.teacherId}
                                                        >
                                                            {t.teacherName}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Subject */}
                                                <select
                                                    value={slot.subject}
                                                    onChange={(e) =>
                                                        updateAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx,
                                                            "subject",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 text-xs  border-gray-200 rounded"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map((s, i) => (
                                                        <option key={i} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Delete */}
                                                <button
                                                    onClick={() =>
                                                        deleteAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 mt-2 text-xs text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add */}
                                        <button
                                            onClick={() =>
                                                addAssignment(dayIndex, periodIndex)
                                            }
                                            className="w-full px-2 py-1 text-xs text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200"
                                        >
                                            + Add Assignment
                                        </button>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClassroomScheduleTable;
