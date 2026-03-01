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

        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/schedule?organisationId=${organisationId}`);
                if (!res.ok) throw new Error("Failed to fetch schedule");
                const data = await res.json();

                // data.data contains the slots
                const slots = Array.isArray(data.data) ? data.data : [];
                setSchedule(slots);
            } catch (error) {
                console.error("Error fetching master schedule:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [organisationId]);

    // TeacherScheduleGrid expects the schedule items to have classroom details
    // We can reuse it for the master schedule, as it groups by day and period

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Organisation Master Schedule</h3>
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
