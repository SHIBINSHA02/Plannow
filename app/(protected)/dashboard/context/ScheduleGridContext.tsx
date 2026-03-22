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
    status?: "idle" | "saving" | "saved" | "error";
};

export type SubjectConfig = {
    subject: string;
    weeklyHours: number;
    currentWeeklyHoursLeft: number;
};

type ScheduleGridContextType = {
    grid: Assignment[][][];
    days: string[];
    periods: string[];
    teachers: Teacher[];
    subjects: string[];
    subjectsConfig: SubjectConfig[];
    remainingHours: Record<string, number>;
    addAssignment: (day: number, period: number) => void;
    updateAssignment: (
        day: number,
        period: number,
        index: number,
        field: keyof Assignment,
        value: any
    ) => void;
    deleteAssignment: (day: number, period: number, index: number) => Promise<void>;
    saveSlot: (day: number, period: number, index: number, slot: Assignment) => void;
    refreshTeachers: () => Promise<void>;
    allOrganisationAssignments: any[];
    allowParallelAssignments: boolean;
    refreshOrganisationData: () => Promise<void>;
};

const ScheduleGridContext =
    createContext<ScheduleGridContextType | null>(null);

/* ---------- Provider ---------- */

export function ScheduleGridProvider({
    children,
    initialGrid,
    days,
    periods,
    subjectsConfig: initialSubjectsConfig,
}: {
    children: ReactNode;
    initialGrid: Assignment[][][];
    days: string[];
    periods: string[];
    subjectsConfig: SubjectConfig[];
}) {
    const params = useParams();
    const organisationId = params.organisationId as string;
    const classroomId = params.classroomId as string;

    const { getToken } = useAuth();

    const [grid, setGrid] = useState(initialGrid);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [subjectsConfig, setSubjectsConfig] = useState<SubjectConfig[]>(initialSubjectsConfig);
    const [allOrganisationAssignments, setAllOrganisationAssignments] = useState<any[]>([]);
    const [allowParallelAssignments, setAllowParallelAssignments] = useState(false);

    useEffect(() => {
        if (initialSubjectsConfig) {
            setSubjectsConfig(initialSubjectsConfig);
        }
    }, [initialSubjectsConfig]);

    useEffect(() => {
        return () => {
            Object.values(saveTimeouts.current).forEach(clearTimeout);
        };
    }, []);

    const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    // Calculate remaining hours based on initial subjectsConfig and current grid
    const remainingHours = React.useMemo(() => {
        const counts: Record<string, number> = {};
        grid.forEach(day => {
            day.forEach(period => {
                period.forEach(slot => {
                    if (slot.subject) {
                        counts[slot.subject] = (counts[slot.subject] || 0) + 1;
                    }
                });
            });
        });

        const remaining: Record<string, number> = {};
        subjectsConfig.forEach(s => {
            remaining[s.subject] = s.weeklyHours - (counts[s.subject] || 0);
        });
        return remaining;
    }, [grid, subjectsConfig]);

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

    /* ---------- Load Organisation Data ---------- */
    const loadOrganisationData = async () => {
        if (!organisationId) return;

        try {
            // Fetch Organisation Settings
            const orgRes = await fetch(`/api/organisation/${organisationId}`);
            if (orgRes.ok) {
                const orgData = await orgRes.json();
                console.log("Loaded organisation data in context:", orgData.organisation.organisationId, "allowParallelAssignments:", orgData.organisation.allowParallelAssignments);
                setAllowParallelAssignments(orgData.organisation.allowParallelAssignments ?? false);
            } else {
                console.error("Failed to fetch organisation in context:", orgRes.status);
            }

            // Fetch All Assignments
            const assignmentsRes = await fetch(`/api/schedule?organisationId=${organisationId}`);
            if (assignmentsRes.ok) {
                const assignmentsData = await assignmentsRes.json();
                setAllOrganisationAssignments(assignmentsData.data || []);
            }
        } catch (error) {
            console.error("Failed to load organisation data:", error);
        }
    };

    useEffect(() => {
        loadOrganisationData();
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
        value: any
    ) => {
        setGrid(prev => {
            const copy = structuredClone(prev);
            (copy[day][period][index] as any)[field] = value;
            return copy;
        });
    };

    /* ---------- SAVE ---------- */

    const saveSlot = async (day: number, period: number, index: number, slot: Assignment) => {
        if (!slot.teacherId || !slot.subject) return;
        if (isDuplicateInCell(day, period, slot)) return;

        // Set status to saving
        updateAssignment(day, period, index, "status", "saving");

        const token = await getToken();
        const isUpdate = Boolean(slot._id);

        try {
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

            if (res.status === 409 || !res.ok) {
                updateAssignment(day, period, index, "status", "error");
                return;
            }

            const savedData = await res.json();
            const savedSlot = savedData.slot || savedData;

            setGrid(prev => {
                const copy = structuredClone(prev);
                copy[day][period][index] = {
                    ...copy[day][period][index],
                    _id: savedSlot._id,
                    status: "saved",
                };
                return copy;
            });

            // Set to idle after a short delay
            setTimeout(() => {
                updateAssignment(day, period, index, "status", "idle");
            }, 2000);

            // Refresh org assignments to ensure consistency
            loadOrganisationData();

        } catch (err) {
            console.error("Save error:", err);
            updateAssignment(day, period, index, "status", "error");
        }
    };

    const debouncedSave = (
        key: string,
        day: number,
        period: number,
        index: number,
        slot: Assignment
    ) => {
        clearTimeout(saveTimeouts.current[key]);
        saveTimeouts.current[key] = setTimeout(
            () => saveSlot(day, period, index, slot),
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

        // Refresh org assignments
        loadOrganisationData();
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
                subjectsConfig,
                remainingHours,
                addAssignment,
                updateAssignment,
                deleteAssignment,
                saveSlot: (d, p, i, s) =>
                    debouncedSave(debounceKey(s, d, p, i), d, p, i, s),
                refreshTeachers: loadTeachers,
                allOrganisationAssignments,
                allowParallelAssignments,
                refreshOrganisationData: loadOrganisationData,
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
