"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ScheduleSlot = {
    _id: string;
    subject: string;
    teacherId: string;
    day: number;
    period: number;
};

type Classroom = {
    classroomId: string;
    className: string;
};

export default function ClassroomSchedulePage() {
    const router = useRouter();
    const params = useParams();

    const organisationId = params.organisationId as string;
    const classroomId = params.classroomId as string;

    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [className, setClassName] = useState<string>(classroomId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                /* 1️⃣ Fetch ALL classrooms (WORKING API) */
                const classroomRes = await fetch(
                    `/api/classrooms?organisationId=${organisationId}`
                );

                if (!classroomRes.ok) {
                    throw new Error("Failed to load classrooms");
                }

                const classrooms: Classroom[] = await classroomRes.json();

                const currentClassroom = classrooms.find(
                    (c) => c.classroomId === classroomId
                );

                if (currentClassroom) {
                    setClassName(currentClassroom.className);
                }

                /* 2️⃣ Fetch schedule */
                const scheduleRes = await fetch(
                    `/api/schedule/classroom/${classroomId}?organisationId=${organisationId}`
                );

                if (!scheduleRes.ok) {
                    throw new Error("Failed to load schedule");
                }

                const scheduleData = await scheduleRes.json();
                setSchedule(scheduleData);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [organisationId, classroomId]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button
                onClick={() =>
                    router.push(`/dashboard/organisations/${organisationId}`)
                }
                className="text-sm text-blue-600 underline mb-4"
            >
                ← Back to classrooms
            </button>

            <h1 className="text-2xl font-semibold mb-4">
                Classroom Schedule – {className}
            </h1>

            {loading && <p>Loading…</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && schedule.length === 0 && (
                <p className="text-gray-400">No schedule found</p>
            )}

            {schedule.length > 0 && (
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(schedule, null, 2)}
                </pre>
            )}
        </div>
    );
}
