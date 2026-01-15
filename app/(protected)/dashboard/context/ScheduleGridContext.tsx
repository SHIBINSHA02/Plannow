"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { useParams } from "next/navigation";

/* ---------- Types ---------- */

export type Teacher = {
    teacherId: string;
    teacherName: string;
    subjects: string[];
};

export type Assignment = {
    _id?: string;          // 👈 backend slot id
    teacherId: string;
    subject: string;
};

type ScheduleGridContextType = {
    grid: Assignment[][][];
    days: string[];
    periods: string[];
    teachers: Teacher[];
    subjects: string[];
    addAssignment: (day: number, period: number) => void;
    updateAssignment: (
        day: number,
        period: number,
        index: number,
        field: keyof Assignment,
        value: string
    ) => void;
    deleteAssignment: (
        day: number,
        period: number,
        index: number
    ) => Promise<void>;
    saveSlot: (day: number, period: number, slot: Assignment) => void;
};

/* ---------- Context ---------- */

const ScheduleGridContext =
    createContext<ScheduleGridContextType | null>(null);

/* ---------- Provider ---------- */

export function ScheduleGridProvider({
    children,
    initialGrid,
    days,
    periods,
}: {
    children: ReactNode;
    initialGrid: Assignment[][][];
    days: string[];
    periods: string[];
}) {
    const params = useParams();
    const organisationId = params.organisationId as string;
    const classroomId = params.classroomId as string;

    const [grid, setGrid] = useState(initialGrid);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    /* ---------- Debounce Store ---------- */
    const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    /* ---------- Load Teachers ---------- */

    useEffect(() => {
        const loadTeachers = async () => {
            const res = await fetch(
                `/api/teacher?organisationId=${organisationId}`
            );
            const data: Teacher[] = await res.json();
            setTeachers(data);

            // extract unique subjects
            const uniqueSubjects = Array.from(
                new Set(data.flatMap((t) => t.subjects))
            );
            setSubjects(uniqueSubjects);
        };

        if (organisationId) loadTeachers();
    }, [organisationId]);

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

    /* ---------- SAVE (POST / PATCH) ---------- */

    const saveSlot = async (
        day: number,
        period: number,
        slot: Assignment
    ) => {
        if (!slot.teacherId && !slot.subject) return;

        const isUpdate = Boolean(slot._id);

        const res = await fetch(
            isUpdate
                ? `/api/schedule/${slot._id}?organisationId=${organisationId}` // PATCH
                : `/api/schedule/classroom/${classroomId}`,                    // POST
            {
                method: isUpdate ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organisationId,
                    classroomId,
                    teacherId: slot.teacherId || undefined,
                    subject: slot.subject || undefined,
                    day: day + 1,
                    period: period + 1,
                }),
            }
        );

        if (!res.ok) return;

        const saved = await res.json();

        // attach _id after first save
        if (!slot._id && saved?._id) {
            setGrid((prev) => {
                const copy = structuredClone(prev);
                const target =
                    copy[day][period][copy[day][period].length - 1];
                target._id = saved._id;
                return copy;
            });
        }
    };

    /* ---------- Debounced Save ---------- */

    const debouncedSave = (
        key: string,
        day: number,
        period: number,
        slot: Assignment
    ) => {
        clearTimeout(saveTimeouts.current[key]);

        saveTimeouts.current[key] = setTimeout(() => {
            saveSlot(day, period, slot);
        }, 400);
    };

    /* ---------- DELETE ---------- */

    const deleteAssignment = async (
        day: number,
        period: number,
        index: number
    ) => {
        const slot = grid[day][period][index];

        if (slot?._id) {
            await fetch(
                `/api/schedule/${slot._id}?organisationId=${organisationId}`,
                { method: "DELETE" }
            );
        }

        setGrid((prev) => {
            const copy = structuredClone(prev);
            copy[day][period].splice(index, 1);
            return copy;
        });
    };

    /* ---------- Provider ---------- */

    return (
        <ScheduleGridContext.Provider
            value={{
                grid,
                days,
                periods,
                teachers,
                subjects,
                addAssignment,
                updateAssignment,
                deleteAssignment,
                saveSlot: (day, period, slot) =>
                    debouncedSave(
                        `${day}-${period}-${slot._id ?? Math.random()}`,
                        day,
                        period,
                        slot
                    ),
            }}
        >
            {children}
        </ScheduleGridContext.Provider>
    );
}

/* ---------- Hook ---------- */

export function useScheduleGrid() {
    const ctx = useContext(ScheduleGridContext);
    if (!ctx) {
        throw new Error(
            "useScheduleGrid must be used inside ScheduleGridProvider"
        );
    }
    return ctx;
}
