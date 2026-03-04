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
        <div className="relative overflow-x-auto rounded-xl shadow-lg shadow-blue-800/20">
            <table className="min-w-full border border-gray-300 rounded-xl">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border border-gray-200 bg-blue-700 text-white">
                            Day / Period
                        </th>
                        {periods.map((p) => (
                            <th
                                key={p}
                                className="px-4 py-2 border border-gray-200 text-center bg-blue-700 text-white"
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
                                                        const teacherId = e.target.value;
                                                        updateAssignment(dayIndex, periodIndex, idx, "teacherId", teacherId);

                                                        // Auto-select subject if only one is available for this teacher
                                                        let finalSubject = slot.subject;
                                                        if (teacherId) {
                                                            const selectedTeacher = teachers.find(t => t.teacherId === teacherId);
                                                            if (selectedTeacher && selectedTeacher.subjects.length === 1) {
                                                                finalSubject = selectedTeacher.subjects[0];
                                                                updateAssignment(dayIndex, periodIndex, idx, "subject", finalSubject);
                                                            }
                                                        }

                                                        saveSlot(dayIndex, periodIndex, idx, {
                                                            ...slot,
                                                            teacherId: teacherId,
                                                            subject: finalSubject,
                                                        });
                                                    }}
                                                    className="w-full px-2 py-1 mb-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {(slot.subject
                                                        ? teachers.filter(t => t.subjects.includes(slot.subject))
                                                        : teachers
                                                    ).map((t) => (
                                                        <option key={t.teacherId} value={t.teacherId}>
                                                            {t.teacherName}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Subject */}
                                                <select
                                                    value={slot.subject}
                                                    onChange={(e) => {
                                                        const subject = e.target.value;
                                                        updateAssignment(dayIndex, periodIndex, idx, "subject", subject);

                                                        // Auto-select teacher if only one is available for this subject
                                                        let finalTeacherId = slot.teacherId;
                                                        if (subject) {
                                                            const availableTeachers = teachers.filter(t => t.subjects.includes(subject));
                                                            if (availableTeachers.length === 1) {
                                                                finalTeacherId = availableTeachers[0].teacherId;
                                                                updateAssignment(dayIndex, periodIndex, idx, "teacherId", finalTeacherId);
                                                            }
                                                        }

                                                        saveSlot(dayIndex, periodIndex, idx, {
                                                            ...slot,
                                                            subject: subject,
                                                            teacherId: finalTeacherId,
                                                        });
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {(slot.teacherId
                                                        ? teachers.find(t => t.teacherId === slot.teacherId)?.subjects || []
                                                        : subjects
                                                    ).map((s) => (
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
