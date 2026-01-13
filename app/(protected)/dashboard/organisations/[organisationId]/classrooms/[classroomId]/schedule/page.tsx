"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassroomScheduleTable from "../../../_components/ClassroomScheduleTable";

/* ---------- Types ---------- */

type ScheduleSlot = {
    _id: string;
    organisationId: string;
    classroomId: string;
    teacherId: string;
    subject: string;
    day: number;     // 1-based
    period: number;  // 1-based
};

type Classroom = {
    classroomId: string;
    className: string;
};

type Assignment = {
    teacherId: string;
    subject: string;
};

/* ---------- Constants ---------- */

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["P1", "P2", "P3", "P4", "P5"];

/* ---------- Helpers ---------- */

const createEmptyGrid = () =>
    days.map(() =>
        periods.map(() => [] as Assignment[])
    );

function scheduleToGrid(schedule: ScheduleSlot[]) {
    const grid = createEmptyGrid();

    schedule.forEach((slot) => {
        const dayIndex = slot.day - 1;
        const periodIndex = slot.period - 1;

        if (grid[dayIndex]?.[periodIndex]) {
            grid[dayIndex][periodIndex].push({
                teacherId: slot.teacherId,
                subject: slot.subject,
            });
        }
    });

    return grid;
}

/* ---------- Page ---------- */

export default function ClassroomSchedulePage() {
    const router = useRouter();
    const params = useParams();

    const organisationId = params.organisationId as string;
    const classroomId = params.classroomId as string;

    const [className, setClassName] = useState(classroomId);
    const [grid, setGrid] = useState<Assignment[][][]>(createEmptyGrid());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Grid Mutations ---------- */

    const addAssignment = (day: number, period: number) => {
        setGrid((prev) => {
            const copy = structuredClone(prev);
            copy[day][period].push({ teacherId: "", subject: "" });
            return copy;
        });
    };

    const updateAssignment = (
        day: number,
        period: number,
        index: number,
        field: keyof Assignment,
        value: string
    ) => {
        setGrid((prev) => {
            const copy = structuredClone(prev);
            copy[day][period][index][field] = value;
            return copy;
        });
    };

    const deleteAssignment = (
        day: number,
        period: number,
        index: number
    ) => {
        setGrid((prev) => {
            const copy = structuredClone(prev);
            copy[day][period].splice(index, 1);
            return copy;
        });
    };

    /* ---------- Fetch ---------- */

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1️⃣ Classrooms (WORKING API)
                const classroomRes = await fetch(
                    `/api/classrooms?organisationId=${organisationId}`
                );

                if (!classroomRes.ok) {
                    throw new Error("Failed to load classrooms");
                }

                const classrooms: Classroom[] = await classroomRes.json();
                const current = classrooms.find(
                    (c) => c.classroomId === classroomId
                );

                if (current) {
                    setClassName(current.className);
                }

                // 2️⃣ Schedule
                const scheduleRes = await fetch(
                    `/api/schedule/classroom/${classroomId}?organisationId=${organisationId}`
                );

                if (!scheduleRes.ok) {
                    throw new Error("Failed to load schedule");
                }

                const scheduleData: ScheduleSlot[] =
                    await scheduleRes.json();

                setGrid(scheduleToGrid(scheduleData));
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [organisationId, classroomId]);

    /* ---------- Render ---------- */

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
                <ClassroomScheduleTable
                    grid={grid}
                    days={days}
                    periods={periods}
                    teachers={[]}   // plug later
                    subjects={[]}   // plug later
                    addAssignment={addAssignment}
                    updateAssignment={updateAssignment}
                    deleteAssignment={deleteAssignment}
                />
            )}
        </div>
    );
}
