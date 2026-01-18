"use client";

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    day: number;        // 1–5
    period: number;     // 1–6
    subject: string;
    classroomId: string;
    organisationId: string;
};

/* ---------- Component ---------- */

export default function TeacherScheduleGrid({
    schedule,
    loading,
}: {
    schedule: ScheduleSlot[];
    loading: boolean;
}) {
    if (loading) {
        return <p className="text-gray-400">Loading schedule…</p>;
    }

    if (!schedule || schedule.length === 0) {
        return <p className="text-sm text-gray-500">No schedule assigned.</p>;
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

    /* ---------- Day labels (display only) ---------- */
    const dayLabels: Record<number, string> = {
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
    };

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full border-collapse border border-gray-300 text-sm rounded-3xl">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium bg-blue-800 text-white">
                            Day / Period
                        </th>
                        {periods.map(p => (
                            <th
                                key={p}
                                className="border border-gray-300 px-4 py-2 text-center font-medium bg-blue-700 text-white"
                            >
                                Period {p}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {days.map(day => (
                        <tr key={day} className="odd:bg-white even:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-semibold bg-blue-700">
                                <div className="b p-2 rounded-lg text-white">
                                {dayLabels[day]}
                                </div>
                            </td>

                            {periods.map(period => {
                                const slots = grid[`${day}-${period}`] ?? [];

                                return (
                                    <td
                                        key={period}
                                        className="border border-gray-300 p-2 align-top text-center"
                                    >
                                        {slots.length > 0 ? (
                                            <div className="space-y-1">
                                                {slots.map((s, index) => (
                                                    <div
                                                        key={`${s.classroomId}-${s.subject}-${index}`}
                                                        className="bg-indigo-100 p-2 rounded text-xs text-left"
                                                    >
                                                        <div className="font-semibold text-indigo-800">
                                                            {s.classroomId}
                                                        </div>
                                                        <div className="text-indigo-600">
                                                            {s.subject}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="rounded bg-green-100 px-3 py-1 text-xs text-green-700 flex items-center justify-center">
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
