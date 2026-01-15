"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassroomScheduleTable from "../../../_components/ClassroomScheduleTable";
import { Assignment } from "../../../../../_types/schedule";
import { ScheduleGridProvider } from "./../../../../../context/ScheduleGridContext";

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    organisationId: string;
    classroomId: string;
    teacherId: string;
    subject: string;
    day: number;
    period: number;
};

type Classroom = {
    classroomId: string;
    className: string;
};

/* ---------- Constants ---------- */

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["P1", "P2", "P3", "P4", "P5"];

/* ---------- Helpers ---------- */

const createEmptyGrid = (): Assignment[][][] =>
    days.map(() => periods.map(() => []));

const scheduleToGrid = (schedule: ScheduleSlot[]) => {
    const grid = createEmptyGrid();

    schedule.forEach((slot) => {
        const d = slot.day - 1;
        const p = slot.period - 1;

        if (grid[d]?.[p]) {
            grid[d][p].push({
                _id: slot._id,          
                teacherId: slot.teacherId,
                subject: slot.subject,
            });
        }
    });

    return grid;
};


/* ---------- Page ---------- */

export default function ClassroomSchedulePage() {
    const router = useRouter();
    const params = useParams();

    const organisationId = params.organisationId as string;
    const classroomId = params.classroomId as string;

    const [className, setClassName] = useState(classroomId);
    const [initialGrid, setInitialGrid] =
        useState<Assignment[][][]>(createEmptyGrid());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const classroomRes = await fetch(
                    `/api/classrooms?organisationId=${organisationId}`
                );
                if (!classroomRes.ok) throw new Error("Failed to load classrooms");

                const classrooms: Classroom[] = await classroomRes.json();
                const current = classrooms.find(
                    (c) => c.classroomId === classroomId
                );
                if (current) setClassName(current.className);

                const scheduleRes = await fetch(
                    `/api/schedule/classroom/${classroomId}?organisationId=${organisationId}`
                );
                if (!scheduleRes.ok) throw new Error("Failed to load schedule");

                const schedule: ScheduleSlot[] = await scheduleRes.json();
                setInitialGrid(scheduleToGrid(schedule));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [organisationId, classroomId]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() =>
                    router.push(`/dashboard/organisations/${organisationId}`)
                }
                className="text-sm text-blue-600 underline mb-4"
            >
                ← Back to classrooms
            </button>

            <h1 className="text-2xl font-semibold mb-6">
                Classroom Schedule – {className}
            </h1>

            {loading && <p>Loading schedule…</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <ScheduleGridProvider
                    initialGrid={initialGrid}
                    days={days}
                    periods={periods}
                >
                    <ClassroomScheduleTable />
                </ScheduleGridProvider>
            )}
        </div>
    );
}
