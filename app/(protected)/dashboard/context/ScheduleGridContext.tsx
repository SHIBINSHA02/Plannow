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
import { useAuth } from "@clerk/nextjs";

/* ---------- Types ---------- */

export type Teacher = {
    teacherId: string;
    teacherName: string;
    subjects: string[];
};

export type Assignment = {
    _id?: string;
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
    deleteAssignment: (day: number, period: number, index: number) => Promise<void>;
    saveSlot: (day: number, period: number, index: number, slot: Assignment) => void;
    refreshTeachers: () => Promise<void>;
};

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

    const { getToken } = useAuth();

    const [grid, setGrid] = useState(initialGrid);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    /* ---------- Helpers ---------- */

    const debounceKey = (slot: Assignment, d: number, p: number, i: number) =>
        slot._id ?? `tmp-${d}-${p}-${i}`;

    const isDuplicateInCell = (day: number, period: number, slot: Assignment) =>
        grid[day][period].some(
            (s) =>
                s !== slot &&
                s.teacherId === slot.teacherId &&
                s.subject === slot.subject
        );

    /* ---------- Load Teachers ---------- */
    const loadTeachers = async () => {
        if (!organisationId || !classroomId) return;
        const res = await fetch(
            `/api/classrooms/classroom/${classroomId}/teachers?organisationId=${organisationId}`
        );

        if (!res.ok) {
            console.error("Failed to fetch teachers");
            return;
        }

        const data: Teacher[] = await res.json();
        setTeachers(data);

        setSubjects(
            Array.from(new Set(data.flatMap(t => t.subjects)))
        );
    };

    useEffect(() => {
        loadTeachers();
    }, [organisationId, classroomId])


    /* ---------- Grid Mutations ---------- */

    const addAssignment = (day: number, period: number) => {
        setGrid(prev => {
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
        setGrid(prev => {
            const copy = structuredClone(prev);
            copy[day][period][index][field] = value;
            return copy;
        });
    };

    /* ---------- SAVE ---------- */

    const saveSlot = async (day: number, period: number, slot: Assignment) => {
        if (!slot.teacherId || !slot.subject) return;
        if (isDuplicateInCell(day, period, slot)) return;

        const token = await getToken();
        const isUpdate = Boolean(slot._id);

        const res = await fetch(
            isUpdate
                ? `/api/schedule/${slot._id}?organisationId=${organisationId}`
                : `/api/schedule/classroom/${classroomId}`,
            {
                method: isUpdate ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    organisationId,
                    classroomId,
                    teacherId: slot.teacherId,
                    subject: slot.subject,
                    day: day + 1,
                    period: period + 1,
                }),
            }
        );

        if (res.status === 409 || !res.ok) return;

        if (!isUpdate) {
            const saved = await res.json();
            setGrid(prev => {
                const copy = structuredClone(prev);
                copy[day][period][copy[day][period].length - 1]._id = saved._id;
                return copy;
            });
        }
    };

    const debouncedSave = (
        key: string,
        day: number,
        period: number,
        slot: Assignment
    ) => {
        clearTimeout(saveTimeouts.current[key]);
        saveTimeouts.current[key] = setTimeout(
            () => saveSlot(day, period, slot),
            400
        );
    };

    /* ---------- DELETE ---------- */

    const deleteAssignment = async (
        day: number,
        period: number,
        index: number
    ) => {
        const slot = grid[day][period][index];

        if (!slot?._id) {
            setGrid(prev => {
                const copy = structuredClone(prev);
                copy[day][period].splice(index, 1);
                return copy;
            });
            return;
        }

        const token = await getToken();

        const res = await fetch(
            `/api/schedule/${slot._id}?organisationId=${organisationId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!res.ok) return;

        setGrid(prev => {
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
                saveSlot: (d, p, i, s) =>
                    debouncedSave(debounceKey(s, d, p, i), d, p, s),
                refreshTeachers: loadTeachers,
            }}
        >
            {children}
        </ScheduleGridContext.Provider>
    );
}

/* ---------- Hook ---------- */

export function useScheduleGrid() {
    const ctx = useContext(ScheduleGridContext);
    if (!ctx) throw new Error("useScheduleGrid must be used inside provider");
    return ctx;
}
