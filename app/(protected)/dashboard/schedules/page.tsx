// app/(protected)/dashboard/schedules/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/theme-provider";
import TeacherScheduleGrid from "./_components/TeacherScheduleGrid";
import WorkloadAnalysis from "./_components/WorkloadAnalysis";
import WeeklyWorkloadChart from "./_components/WeeklyWorkloadChart";
import StatsOverview from "./_components/StatsOverview";
import TodaysClasses from "./_components/TodaysClasses";

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
    className: string;
    classroomId: string;
    organisationId: string;
};

/* ---------- Page ---------- */

export default function TeacherSchedulePage() {
    const { theme } = useTheme();
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
                const res = await fetch("/api/profile/teacher", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) throw new Error(data?.message || "Teacher fetch failed");

                if (Array.isArray(data.teachers)) {
                    setTeachers(data.teachers);
                    if (data.teachers.length > 0) {
                        const t = data.teachers[0];
                        setSelectedTeacherId(t.teacherId);
                        setSelectedOrganisationId(t.organisations[0]?.id ?? null);
                    }
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
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
                if (!res.ok) throw new Error("Failed to fetch schedule");
                setSchedule(Array.isArray(data) ? data : []);
            } catch {
                setSchedule([]);
            } finally {
                setLoadingSchedule(false);
            }
        };
        fetchSchedule();
    }, [selectedTeacherId, selectedOrganisationId]);

    /* ---------- UI Helpers ---------- */
    const cardBase = `p-6 rounded-2xl shadow-sm border ${theme === "light" ? "bg-white border-gray-200" : "bg-[#0f172a] border-slate-800"
        }`;
    const textColor = theme === "light" ? "text-gray-900" : "text-white";
    const subTextColor = theme === "light" ? "text-gray-500" : "text-slate-400";

    if (loadingTeachers) return <p className={`p-6 ${subTextColor}`}>Loading...</p>;

    return (
        <div className="space-y-6 max-w-6xl lg:mx-auto lg:p-6">
            {teachers.length > 1 && (
                <div>
                    <label className={`block text-sm font-medium mb-1 ${textColor}`}>Select Teacher Profile</label>
                    <select
                        value={selectedTeacherId ?? ""}
                        onChange={(e) => {
                            const teacher = teachers.find((t) => t.teacherId === e.target.value);
                            setSelectedTeacherId(e.target.value);
                            setSelectedOrganisationId(teacher?.organisations[0]?.id ?? null);
                        }}
                        className={`border rounded-lg px-3 py-2 w-full max-w-sm ${theme === "light" ? "bg-white border-gray-300" : "bg-[#0f172a] border-slate-700 text-white"
                            }`}
                    >
                        {teachers.map((t) => (
                            <option key={t.teacherId} value={t.teacherId}>
                                {t.organisations.map((o: Organisation) => o.name).join(", ")}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedTeacherId && (
                <div className="space-y-6">
                    <div>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Teaching Schedule</h2>
                        <p className={`text-sm ${subTextColor}`}>Overview of classes and workload.</p>
                    </div>

                    <StatsOverview schedule={schedule} />

                    <div className={cardBase}>
                        <h3 className={`text-xl font-bold mb-6 ${textColor}`}>Master Schedule</h3>
                        <TeacherScheduleGrid schedule={schedule} loading={loadingSchedule} teachersMap={undefined} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                        <div className="xl:col-span-1">
                            <TodaysClasses schedule={schedule} />
                        </div>
                        <div className="xl:col-span-2 flex flex-col gap-6">
                            <div className={cardBase}>
                                <h3 className={`text-lg font-bold mb-4 border-b pb-3 ${textColor}`}>Workload Distribution</h3>
                                <WorkloadAnalysis schedule={schedule} />
                            </div>
                            <div className={cardBase}>
                                <h3 className={`text-lg font-bold mb-4 border-b pb-3 ${textColor}`}>Weekly Trend</h3>
                                <WeeklyWorkloadChart schedule={schedule} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}