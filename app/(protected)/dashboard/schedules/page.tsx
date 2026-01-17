"use client";

import { useEffect, useState } from "react";

/* ---------- Types ---------- */

type Organisation = {
    id: string;
    name: string;
};

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    email: string;
    subjects: string[];
    organisations: Organisation[];
};

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    classroomId: string;
    organisationId: string;
};

/* ---------- Page ---------- */

export default function TeacherSchedulePage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedOrganisationId, setSelectedOrganisationId] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Fetch Teachers ---------- */

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoadingTeachers(true);
                setError(null);

                const res = await fetch("/api/profile/teacher", {
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message || "Teacher fetch failed");
                }

                if (Array.isArray(data.teachers)) {
                    setTeachers(data.teachers);

                    // Auto-select if only one teacher
                    if (data.teachers.length === 1) {
                        const t = data.teachers[0];
                        setSelectedTeacherId(t.teacherId);
                        setSelectedOrganisationId(t.organisations[0]?.id ?? null);
                    }
                } else {
                    setTeachers([]);
                }
            } catch (err: any) {
                console.error("Teacher fetch error:", err);
                setError(err.message);
                setTeachers([]);
            } finally {
                setLoadingTeachers(false);
            }
        };

        fetchTeachers();
    }, []);

    /* ---------- Fetch Schedule ---------- */

    useEffect(() => {
        if (!selectedTeacherId || !selectedOrganisationId) return;

        const fetchSchedule = async () => {
            try {
                setLoadingSchedule(true);

                const res = await fetch(
                    `/api/schedule/teacher/${selectedTeacherId}?organisationId=${selectedOrganisationId}`,
                    { cache: "no-store" }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to fetch schedule");
                }

                setSchedule(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Schedule fetch error:", err);
                setSchedule([]);
            } finally {
                setLoadingSchedule(false);
            }
        };

        fetchSchedule();
    }, [selectedTeacherId, selectedOrganisationId]);

    /* ---------- States ---------- */

    if (loadingTeachers) {
        return <p className="p-6 text-sm text-gray-400">Loading teacher profiles…</p>;
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (teachers.length === 0) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-500">
                    No teacher profiles linked to your account.
                </p>
            </div>
        );
    }

    /* ---------- UI ---------- */

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">

            {teachers.length > 1 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Teacher Profile
                    </label>

                    <select
                        value={selectedTeacherId ?? ""}
                        onChange={e => {
                            const teacher = teachers.find(
                                t => t.teacherId === e.target.value
                            );

                            setSelectedTeacherId(e.target.value);
                            setSelectedOrganisationId(
                                teacher?.organisations[0]?.id ?? null
                            );
                        }}
                        className="border rounded-lg px-3 py-2 w-full max-w-sm"
                    >
                        <option value="" disabled>
                            Choose teacher
                        </option>

                        {teachers.map(t => (
                            <option key={t.teacherId} value={t.teacherId}>
                                {t.teacherName} —{" "}
                                {t.organisations.map(o => o.name).join(", ")}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedTeacherId && (
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">
                        Teaching Schedule
                    </h2>

                    {loadingSchedule ? (
                        <p className="text-gray-400">Loading schedule…</p>
                    ) : schedule.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No schedule assigned.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {schedule.map(slot => (
                                <div
                                    key={slot._id}
                                    className="flex justify-between border rounded px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium">{slot.subject}</p>
                                        <p className="text-xs text-gray-500">
                                            Day {slot.day} · Period {slot.period}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {slot.classroomId}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
