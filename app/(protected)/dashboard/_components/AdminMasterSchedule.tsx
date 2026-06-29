// app/(protected)/dashboard/_components/AdminMasterSchedule.tsx
"use client";

import { useState, useEffect } from "react";
import TeacherScheduleGrid from "../schedules/_components/TeacherScheduleGrid";
import { useTheme } from "@/app/theme-provider"; 

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    classroomId: string;
    organisationId: string;
    teacherId?: string;
};

type Props = {
    organisationId: string;
    teachersMap: Record<string, string>;
};

export default function AdminMasterSchedule({ organisationId, teachersMap }: Props) {
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme(); // Subscribed to current theme

    useEffect(() => {
        if (!organisationId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Classrooms to get mapping of ID -> Name
                const classroomsRes = await fetch(`/api/classrooms?organisationId=${organisationId}`);
                const classroomsMap: Record<string, string> = {};
                if (classroomsRes.ok) {
                    const classroomsData = await classroomsRes.json();
                    classroomsData.forEach((c: { classroomId: string; className: string }) => {
        classroomsMap[c.classroomId] = c.className;
    });
                }

                // 2. Fetch Schedule
                const res = await fetch(`/api/schedule?organisationId=${organisationId}`);
                if (!res.ok) throw new Error("Failed to fetch schedule");
                const data = await res.json();

                // data.data contains the slots
                const slots = Array.isArray(data.data) ? data.data : [];

                // 3. Enrich slots with className from classroomsMap
                const enrichedSlots = slots.map((slot: ScheduleSlot) => ({
                    ...slot,
                    className: slot.className || classroomsMap[slot.classroomId] || "Unknown Class"
                }));

                setSchedule(enrichedSlots);
            } catch (error) {
                console.error("Error fetching master schedule:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [organisationId]);

    return (
        <div
            className={`p-6 md:p-8 rounded-3xl border transition-colors duration-200
                ${theme === "light"
                    ? "bg-white border-slate-100"
                    : "bg-[#0f172a] border-slate-800"
                }`}
        >
            {/* Header / Sub-title Section */}
            <div
                className={`flex items-center justify-between gap-4 mb-6 pb-4 border-b transition-colors duration-200
                    ${theme === "light"
                        ? "border-slate-50"
                        : "border-slate-800/60"
                    }`}
            >
                <div className="space-y-1">
                    <h2
                        className={`text-lg font-medium tracking-tight transition-colors duration-200
                            ${theme === "light" ? "text-slate-900" : "text-white"}`}
                    >
                        Master Timetable Grid
                    </h2>
                    <p
                        className={`text-xs font-light transition-colors duration-200
                            ${theme === "light" ? "text-slate-400" : "text-slate-400"}`}
                    >
                        Full view of all distributed classes and active sessions across the organization.
                    </p>
                </div>

                {/* Status Indicator */}
                <div
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors duration-200
                        ${theme === "light"
                            ? "bg-blue-50/60 border-blue-100/50 text-blue-600"
                            : "bg-blue-950/40 border-blue-900/50 text-blue-400"
                        }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[11px] font-medium tracking-wide uppercase">Live Sync</span>
                </div>
            </div>

            {/* Grid component container */}
            <div className="overflow-hidden rounded-xl">
                <TeacherScheduleGrid
                    schedule={schedule}
                    loading={loading}
                    teachersMap={teachersMap}
                />
            </div>
        </div>
    );
}