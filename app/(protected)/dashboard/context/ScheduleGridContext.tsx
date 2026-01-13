"use client";

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

/* ---------- Types ---------- */

export type Teacher = {
    teacherId: string;
    teacherName: string;
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
    const [grid, setGrid] = useState<Assignment[][][]>(initialGrid);

    // ✅ Explicitly typed arrays (FIX)
    const teachers: Teacher[] = [];
    const subjects: string[] = [];

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
