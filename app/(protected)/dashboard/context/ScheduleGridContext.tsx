"use client";

import React, {
    createContext,
    useContext,
    useEffect,
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
    ) => void;
    saveSlot: (day: number, period: number, slot: Assignment) => Promise<void>;
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

    const [grid, setGrid] = useState(initialGrid);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    /* ---------- Load teachers ---------- */

    useEffect(() => {
        const loadTeachers = async () => {
            const res = await fetch(
                `/api/teacher?organisationId=${organisationId}`
            );
            const data: Teacher[] = await res.json();
            setTeachers(data);

            // collect unique subjects
            const uniqueSubjects = Array.from(
                new Set(data.flatMap(t => t.subjects))
            );
            setSubjects(uniqueSubjects);
        };

        if (organisationId) loadTeachers();
    }, [organisationId]);

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

    const deleteAssignment = (day: number, period: number, index: number) => {
        setGrid(prev => {
            const copy = structuredClone(prev);
            copy[day][period].splice(index, 1);
            return copy;
        });
    };

    /* ---------- Save Slot ---------- */

    const saveSlot = async (
        day: number,
        period: number,
        slot: Assignment
    ) => {
        await fetch(`/api/schedule/classroom/${classroomId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                organisationId,
                classroomId,
                teacherId: slot.teacherId,
                subject: slot.subject,
                day: day + 1,
                period: period + 1,
            }),
        });
    };

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
                saveSlot,
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
