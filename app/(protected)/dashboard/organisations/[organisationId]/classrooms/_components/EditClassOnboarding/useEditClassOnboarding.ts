"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScheduleGrid } from "../../../../../../dashboard/context/ScheduleGridContext";
import type { EditClassOnboardingProps, SubjectInput, Teacher } from "./types";

export function useEditClassOnboarding({
    organisationId,
    classroomId,
    currentClassroom,
    onSuccess,
}: EditClassOnboardingProps) {
    const router = useRouter();
    const { refreshTeachers } = useScheduleGrid();

    const [className, setClassName] = useState(currentClassroom?.className || "");
    const [department, setDepartment] = useState(currentClassroom?.department || "");
    const [adminEmail, setAdminEmail] = useState(currentClassroom?.adminEmail || "");

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showTeacherList, setShowTeacherList] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");
    const [subjects, setSubjects] = useState<SubjectInput[]>(
        currentClassroom?.subjects?.map((s: any) => ({
            subject: s.subject,
            weeklyHours: s.weeklyHours,
            defaultTeacherId: s.defaultTeacherId || "",
        })) || []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!organisationId) return;

        const fetchTeachers = async () => {
            try {
                setTeachersLoading(true);

                const res = await fetch(
                    `/api/teachers?organisationId=${organisationId}`
                );

                if (!res.ok) throw new Error("Failed to fetch teachers");

                const data = await res.json();
                setTeachers(data);
            } catch (err) {
                console.error(err);
                setTeachers([]);
            } finally {
                setTeachersLoading(false);
            }
        };

        fetchTeachers();
    }, [organisationId]);

    const filteredTeachers = teachers.filter(t =>
        t.teacherName.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const selectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setTeacherSearch(teacher.teacherName);
        setSelectedSubject("");
        setShowTeacherList(false);
    };

    const addSubject = () => {
        if (!selectedTeacher || !selectedSubject || !weeklyHours) return;
        if (subjects.some(s => s.subject === selectedSubject)) return;

        setSubjects(prev => [
            ...prev,
            {
                subject: selectedSubject,
                weeklyHours: Number(weeklyHours),
                defaultTeacherId: selectedTeacher.teacherId,
            },
        ]);

        setSelectedSubject("");
        setWeeklyHours("");
    };

    const removeSubject = (index: number) => {
        setSubjects(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllSubjects = (e: React.MouseEvent) => {
        e.preventDefault();
        setSubjects([]);
    };

    const updateSubject = (index: number, updates: Partial<SubjectInput>) => {
        setSubjects(prev =>
            prev.map((s, i) => {
                if (i !== index) return s;

                const newSubject = { ...s, ...updates };

                if (updates.defaultTeacherId) {
                    const teacher = teachers.find(t => t.teacherId === updates.defaultTeacherId);
                    if (teacher && !teacher.subjects.includes(newSubject.subject)) {
                        newSubject.subject = "";
                    }
                }

                return newSubject;
            })
        );
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!className || !adminEmail || subjects.length === 0) {
            setError("Class name, admin email, & at least one subject are required");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`/api/classrooms/classroom/${classroomId}?organisationId=${organisationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    className,
                    department,
                    adminEmail,
                    subjects,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update classroom");
            }

            setSuccessMsg("Classroom updated successfully!");
            onSuccess?.();
            await refreshTeachers();

            router.push(`/dashboard/organisations/${organisationId}/classrooms/${classroomId}/schedule`);

            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    return {
        className,
        setClassName,
        department,
        setDepartment,
        adminEmail,
        setAdminEmail,
        teachers,
        teachersLoading,
        teacherSearch,
        setTeacherSearch,
        selectedTeacher,
        setSelectedTeacher,
        showTeacherList,
        setShowTeacherList,
        selectedSubject,
        setSelectedSubject,
        weeklyHours,
        setWeeklyHours,
        subjects,
        loading,
        error,
        successMsg,
        filteredTeachers,
        selectTeacher,
        addSubject,
        removeSubject,
        clearAllSubjects,
        updateSubject,
        submit,
    };
}
