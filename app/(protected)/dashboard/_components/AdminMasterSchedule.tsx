"use client";

import { useState, useEffect } from "react";
import TeacherScheduleGrid from "../schedules/_components/TeacherScheduleGrid";

type ScheduleSlot = {
    _id: string;
    day: number;
    period: number;
    subject: string;
    className: string;
    classroomId: string;
    organisationId: string;
    teacherId?: string; // We might need to map this to teacher name
};

type Props = {
    organisationId: string;
    teachersMap: Record<string, string>;
};

export default function AdminMasterSchedule({ organisationId, teachersMap }: Props) {
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organisationId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Classrooms to get mapping of ID -> Name
                const classroomsRes = await fetch(`/api/classrooms?organisationId=${organisationId}`);
                let classroomsMap: Record<string, string> = {};
                if (classroomsRes.ok) {
                    const classroomsData = await classroomsRes.json();
                    classroomsData.forEach((c: any) => {
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

    // TeacherScheduleGrid expects the schedule items to have classroom details
    // We can reuse it for the master schedule, as it groups by day and period

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="mb-6">
                <p className="text-sm text-gray-500 mt-1">Full view of all classes across the organisation</p>
            </div>

            {/* Note: TeacherScheduleGrid expects a slightly different data shape for a single teacher, 
                but we can use it to render a full grid if we pass the raw slots.
                We will pass the teachers map down if we need to show teacher names instead of just subjects.
               */}
            <TeacherScheduleGrid
                schedule={schedule}
                loading={loading}
            />
        </div>
    );
}
