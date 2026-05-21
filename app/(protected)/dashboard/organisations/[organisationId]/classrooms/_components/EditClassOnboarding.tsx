"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Classroom } from "@/types/classroom";
import { useScheduleGrid } from "../../../../../dashboard/context/ScheduleGridContext";

/* ---------- Types ---------- */

type SubjectInput = {
    subject: string;
    weeklyHours: number;
    defaultTeacherId: string;
};

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    subjects: string[];
};

type Props = {
    organisationId: string;
    classroomId: string;
    currentClassroom: any; 
    adminEmail?: string; 
    onSuccess?: () => void;
};

/* ---------- Component ---------- */

export default function EditClassOnboarding({
    organisationId,
    classroomId,
    currentClassroom,
    onSuccess,
}: Props) {
    const router = useRouter();
    const { refreshTeachers } = useScheduleGrid();

    /* ---------- Classroom ---------- */

    const [className, setClassName] = useState(currentClassroom?.className || "");
    const [department, setDepartment] = useState(currentClassroom?.department || "");
    // 1. Added explicit state for the Admin's Email
    const [adminEmail, setAdminEmail] = useState(currentClassroom?.adminEmail || "");

    /* ---------- Teachers ---------- */

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(false);

    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showTeacherList, setShowTeacherList] = useState(false);

    /* ---------- Subjects ---------- */

    const [selectedSubject, setSelectedSubject] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");

    // Initialize subjects from the current classroom data if available
    const [subjects, setSubjects] = useState<SubjectInput[]>(
        currentClassroom?.subjects?.map((s: any) => ({
            subject: s.subject,
            weeklyHours: s.weeklyHours,
            defaultTeacherId: s.defaultTeacherId || "",
        })) || []
    );

    /* ---------- UI ---------- */

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    /* ---------- Fetch Teachers ---------- */

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

    /* ---------- Filter Teachers ---------- */

    const filteredTeachers = teachers.filter(t =>
        t.teacherName.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    /* ---------- Handlers ---------- */

    const selectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setTeacherSearch(teacher.teacherName);
        setSelectedSubject("");
        setShowTeacherList(false);
    };

    const addSubject = () => {
        if (!selectedTeacher || !selectedSubject || !weeklyHours) return;

        // prevent duplicate subject
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

    // Added clear all handler for the layout button
    const clearAllSubjects = (e: React.MouseEvent) => {
        e.preventDefault();
        setSubjects([]);
    };

    const updateSubject = (index: number, updates: Partial<SubjectInput>) => {
        setSubjects(prev =>
            prev.map((s, i) => {
                if (i !== index) return s;

                const newSubject = { ...s, ...updates };

                // If teacher changed, check if they teach the current subject
                if (updates.defaultTeacherId) {
                    const teacher = teachers.find(t => t.teacherId === updates.defaultTeacherId);
                    if (teacher && !teacher.subjects.includes(newSubject.subject)) {
                        newSubject.subject = ""; // Reset subject if new teacher doesn't teach it
                    }
                }

                return newSubject;
            })
        );
    };

    /* ---------- Submit ---------- */

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Validating both missing values and matching the schema requirements
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
                    adminEmail, // 2. Fixed: Correctly appending adminEmail to payload
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

    /* ---------- UI ---------- */

    return (
        <form onSubmit={submit} className="space-y-5 text-gray-700 mt-8 border-t border-blue-700 pt-10 w-full max-w-7xl mx-auto">
            <div className="mb-4">
                <h2 className="font-medium text-xl text-blue-700 mb-4">Classroom Details</h2>
                <p className="text-sm text-gray-500">Update the class name, department, or subjects.</p>
            </div>

            {error && (
                <p className="p-2 bg-red-100 text-red-700 rounded-xl">
                    {error}
                </p>
            )}

            {successMsg && (
                <p className="p-2 bg-green-100 text-green-700 rounded-xl">
                    {successMsg}
                </p>
            )}

            {/* ---------- Classroom Info ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                        Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        placeholder="Classroom Name"
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                        Department
                    </label>
                    <input
                        placeholder="Department"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                    />
                </div>
            </div>

            {/* 3. Fixed Admin Input Row Fields and Target References */}
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                    Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="admin@school.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                    required
                />
            </div>

            <div className="border-b my-10 border-blue-800 " />

            {/* ---------- Teacher Search ---------- */}
            <div className="bg-gray-50/50 py-4 rounded-2xl space-y-4 text-sm mt-4">
                <h3 className="font-medium text-xl text-blue-700">Add Subjects</h3>
                <div className="relative">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                        Search & Select Teacher
                    </label>

                    <input
                        value={teacherSearch}
                        onChange={e => {
                            setTeacherSearch(e.target.value);
                            setShowTeacherList(true);
                            if (selectedTeacher && selectedTeacher.teacherName !== e.target.value) {
                                setSelectedTeacher(null);
                            }
                        }}
                        onFocus={() => setShowTeacherList(true)}
                        placeholder="Type teacher name..."
                        className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                    />

                    {showTeacherList && teacherSearch && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto z-50">

                            {teachersLoading && (
                                <div className="p-3 text-sm text-gray-400 text-center">
                                    Loading teachers...
                                </div>
                            )}

                            {!teachersLoading && filteredTeachers.length === 0 && (
                                <div className="p-3 text-sm text-gray-400 text-center">
                                    No teachers found
                                </div>
                            )}

                            {filteredTeachers.map(t => (
                                <div
                                    key={t.teacherId}
                                    onClick={() => selectTeacher(t)}
                                    className="p-3 cursor-pointer hover:bg-blue-50 border-b last:border-0"
                                >
                                    {t.teacherName}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ---------- Subject + Hours ---------- */}

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            disabled={!selectedTeacher}
                            className="w-full p-2 border border-gray-300 rounded-xl focus:border-blue-500 bg-white disabled:opacity-50"
                        >
                            <option value="">Select Subject</option>

                            {selectedTeacher?.subjects.map(sub => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Hrs/Wk</label>
                        <input
                            type="number"
                            placeholder="Hours"
                            value={weeklyHours}
                            onChange={e => setWeeklyHours(e.target.value)}
                            className="w-20 p-2 border border-gray-300 rounded-xl bg-white"
                            min="1"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={addSubject}
                            disabled={!selectedTeacher || !selectedSubject || !weeklyHours}
                            className="px-4 py-2 h-[42px] bg-blue-600 border border-gray-200  hover:bg-blue-800 text-white rounded-xl "
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------- Added Subjects ---------- */}
            <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-600 block">Current Subjects ({subjects.length})</label>
                {subjects.length === 0 && (
                    <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-xl text-center">
                        No subjects added yet.
                    </div>
                )}
                {subjects.map((s, idx) => (
                    <div
                        key={`${idx}`}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Subject Name Dropdown */}
                        <div className="md:col-span-5 space-y-1">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Subject Name</label>
                            <select
                                value={s.subject}
                                onChange={(e) => updateSubject(idx, { subject: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                            >
                                <option value="">Select Subject</option>
                                {teachers.find(t => t.teacherId === s.defaultTeacherId)?.subjects.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Weekly Hours */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Hrs/Wk</label>
                            <input
                                type="number"
                                value={s.weeklyHours}
                                onChange={(e) => updateSubject(idx, { weeklyHours: Number(e.target.value) })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                min="1"
                            />
                        </div>

                        {/* Teacher Select */}
                        <div className="md:col-span-4 space-y-1">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Assigned Teacher</label>
                            <select
                                value={s.defaultTeacherId}
                                onChange={(e) => updateSubject(idx, { defaultTeacherId: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => (
                                    <option key={t.teacherId} value={t.teacherId}>
                                        {t.teacherName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Remove Button */}
                        <div className="md:col-span-1 flex justify-end">
                            <button
                                type="button"
                                onClick={() => removeSubject(idx)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all group"
                                aria-label="Remove subject"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="group-hover:scale-110 transition-transform"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={clearAllSubjects}
                        className="px-4 rounded-xl py-3 bg-black text-white mt-4 border border-gray-700 "
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 mt-6"
            >
                {loading ? "Saving Changes..." : "Save Classroom Details"}
            </button>

        </form>
    );
}