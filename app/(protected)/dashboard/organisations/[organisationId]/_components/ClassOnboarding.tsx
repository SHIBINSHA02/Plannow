"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/theme-provider";

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
    onSuccess?: () => void;
};

/* ---------- Component ---------- */

export default function ClassOnboarding({
    organisationId,
    onSuccess,
}: Props) {
    const { theme } = useTheme();

    /* ---------- Classroom ---------- */
    const [className, setClassName] = useState("");
    const [department, setDepartment] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    /* ---------- Teachers ---------- */
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showTeacherList, setShowTeacherList] = useState(false);

    /* ---------- Subjects ---------- */
    const [selectedSubject, setSelectedSubject] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");
    const [subjects, setSubjects] = useState<SubjectInput[]>([]);

    /* ---------- UI ---------- */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    /* ---------- Submit ---------- */
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!className || !adminEmail || subjects.length === 0) {
            setError("Class name, admin email & at least one subject required");
            return;
        }

        try {
            setLoading(true);
            await fetch("/api/classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organisationId,
                    className,
                    department,
                    adminEmail,
                    subjects,
                }),
            });

            onSuccess?.();
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={submit}
            className={`space-y-5 text-sm transition-colors duration-200
                ${theme === "light" ? "text-gray-700" : "text-slate-200"}`}
        >
            {error && (
                <p className={`p-3 rounded-lg font-medium text-xs border
                    ${theme === "light"
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-red-950/40 border-red-900/30 text-red-400"}`}
                >
                    {error}
                </p>
            )}

            {/* ---------- Classroom Info ---------- */}
            <div className="space-y-4">
                <input
                    placeholder="Classroom Name"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                />

                <input
                    placeholder="Admin Email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                />

                <input
                    placeholder="Department (Optional)"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                />
            </div>

            {/* ---------- Teacher Search ---------- */}
            <div className="relative space-y-1.5">
                <label className={`text-xs font-semibold ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                    Search & Select Teacher
                </label>

                <input
                    value={teacherSearch}
                    onChange={e => {
                        setTeacherSearch(e.target.value);
                        setShowTeacherList(true);
                        setSelectedTeacher(null);
                    }}
                    onFocus={() => setShowTeacherList(true)}
                    placeholder="Type teacher name..."
                    className={`w-full p-2.5 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                />

                {showTeacherList && teacherSearch && (
                    <div
                        className={`absolute left-0 right-0 mt-1 border rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y transition-all
                            ${theme === "light"
                                ? "bg-white border-gray-200 divide-gray-100"
                                : "bg-slate-950 border-slate-800 divide-slate-900"}`}
                    >
                        {teachersLoading && (
                            <div className={`p-3 text-xs ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                                Loading teachers...
                            </div>
                        )}

                        {!teachersLoading && filteredTeachers.length === 0 && (
                            <div className={`p-3 text-xs ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                                No teachers found
                            </div>
                        )}

                        {filteredTeachers.map(t => (
                            <div
                                key={t.teacherId}
                                onClick={() => selectTeacher(t)}
                                className={`p-2.5 text-xs cursor-pointer transition-colors
                                    ${theme === "light"
                                        ? "hover:bg-blue-50 text-gray-700"
                                        : "hover:bg-blue-950/40 text-slate-300"}`}
                            >
                                {t.teacherName}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ---------- Subject + Hours Assignment Selection ---------- */}
            <div className="flex gap-2">
                <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    disabled={!selectedTeacher}
                    className={`flex-1 p-2.5 border rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                >
                    <option value="">Select Subject</option>
                    {selectedTeacher?.subjects.map(sub => (
                        <option key={sub} value={sub}>
                            {sub}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Hours"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(e.target.value)}
                    className={`w-24 p-2.5 border rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        ${theme === "light"
                            ? "border-gray-200 bg-white text-gray-900"
                            : "border-slate-800 bg-slate-900 text-slate-100"}`}
                />

                <button
                    type="button"
                    onClick={addSubject}
                    className="px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Add
                </button>
            </div>

            {/* ---------- Added Subjects Display Grid/List ---------- */}
            <div className="space-y-2">
                {subjects.map(s => (
                    <div
                        key={s.subject + s.defaultTeacherId}
                        className={`flex justify-between items-center border p-3 rounded-xl transition-colors text-xs font-medium
                            ${theme === "light"
                                ? "border-gray-200 bg-gray-50 text-gray-700"
                                : "border-slate-800 bg-slate-900/60 text-slate-300"}`}
                    >
                        <span>
                            <span className={theme === "light" ? "text-gray-900 font-semibold" : "text-slate-100 font-semibold"}>
                                {s.subject}
                            </span>
                            <span className={`mx-2 ${theme === "light" ? "text-gray-400" : "text-slate-600"}`}>•</span>
                            {teachers.find(t => t.teacherId === s.defaultTeacherId)?.teacherName}
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md ${theme === "light" ? "bg-gray-200/60 text-gray-600" : "bg-slate-800 text-slate-400"}`}>
                                {s.weeklyHours}h/wk
                            </span>
                        </span>

                        <button
                            type="button"
                            onClick={() => setSubjects(prev => prev.filter(x => x !== s))}
                            className={`text-lg font-light leading-none transition-colors
                                ${theme === "light" ? "text-gray-400 hover:text-red-500" : "text-slate-500 hover:text-red-400"}`}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* ---------- Main Form Submission Action ---------- */}
            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 shadow-md shadow-blue-500/10"
            >
                {loading ? "Creating..." : "Create Classroom"}
            </button>
        </form>
    );
}