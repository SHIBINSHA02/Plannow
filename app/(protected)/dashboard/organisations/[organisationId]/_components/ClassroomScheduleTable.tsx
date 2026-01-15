"use client";

import React from "react";
import { useScheduleGrid } from "./../../../context/ScheduleGridContext";

const ClassroomScheduleTable: React.FC = () => {
    const {
        grid,
        days,
        periods,
        teachers,
        subjects,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        saveSlot,
    } = useScheduleGrid();

    return (
        <div className="relative overflow-x-auto rounded-xl shadow-lg shadow-blue-50">
            <table className="min-w-full border border-gray-300 rounded-xl">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border border-gray-200">
                            Day / Period
                        </th>
                        {periods.map((p) => (
                            <th
                                key={p}
                                className="px-4 py-2 border border-gray-200 text-center"
                            >
                                {p}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {grid.map((row, dayIndex) => (
                        <tr key={dayIndex}>
                            <td className="px-4 py-2 border border-gray-200 rounded-lg font-semibold bg-gray-50">
                                {days[dayIndex]}
                            </td>

                            {row.map((cell, periodIndex) => (
                                <td
                                    key={periodIndex}
                                    className="p-2 min-w-[180px] border border-gray-300 align-top"
                                >
                                    <div className="space-y-2">
                                        {cell.map((slot, idx) => (
                                            <div
                                                key={
                                                    slot._id ??
                                                    slot.teacherId + "-" + slot.subject + "-" + dayIndex + "-" + periodIndex
                                                }
                                                className="p-2 rounded bg-gray-50 border border-gray-200"
                                            >


                                                
                                        
                                                {/* Teacher */}
                                                <select
                                                    value={slot.teacherId}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        updateAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx,
                                                            "teacherId",
                                                            value
                                                        );
                                                        saveSlot(
                                                            dayIndex,
                                                            periodIndex,idx,
                                                            {
                                                                ...slot,
                                                                teacherId:
                                                                    value,
                                                            }
                                                        );
                                                    }}
                                                    className="w-full px-2 py-1 mb-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">
                                                        Select Teacher
                                                    </option>
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
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        updateAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx,
                                                            "subject",
                                                            value
                                                        );
                                                        saveSlot(
                                                            dayIndex,
                                                            periodIndex,idx,
                                                            {
                                                                ...slot,
                                                                subject: value,
                                                            }
                                                        );
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">
                                                        Select Subject
                                                    </option>
                                                    {subjects.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Delete */}
                                                <button
                                                    type="button"   
                                                    onClick={() =>
                                                        deleteAssignment(
                                                            dayIndex,
                                                            periodIndex,
                                                            idx
                                                        )
                                                    }
                                                    className="w-full mt-2 px-2 py-1 text-xs text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        ))}

                                        {/* Add Assignment */}
                                        <button
                                            type="button"   
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
