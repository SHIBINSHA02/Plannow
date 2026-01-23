"use client";

import { useState } from "react";

/* ---------- Types ---------- */

type SubjectInput = {
    subject: string;
    weeklyHours: number;
};

type Teacher = {
    id: string;
    name: string;
    subjects: string[];
};

type Props = {
    organisationId: string;
    onSuccess?: () => void;
};

/* ---------- Mock data (replace later) ---------- */

const getTeachersForOrganisation = (
    organisationId: string
): Teacher[] => {
    return [
        { id: "T1", name: "Alice Johnson", subjects: ["Maths", "Physics"] },
        { id: "T2", name: "Bob Smith", subjects: ["Chemistry", "Biology"] },
        { id: "T3", name: "Carol Davis", subjects: ["Computer Science", "Maths","English","Social"] },
        { id: "T4", name: "David Lee", subjects: ["English", "History"] },
    ];
};

/* ---------- Component ---------- */

export default function ClassOnboarding({
    organisationId,
    onSuccess,
}: Props) {
    /* ---------- Classroom ---------- */

    const [className, setClassName] = useState("");
    const [department, setDepartment] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    /* ---------- Teachers & Subjects ---------- */

    const teachers = getTeachersForOrganisation(organisationId);

    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] =
        useState<Teacher | null>(null);
    const [showTeacherList, setShowTeacherList] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");
    const [subjects, setSubjects] = useState<SubjectInput[]>([]);

    /* ---------- UI ---------- */

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Filtered shortlist ---------- */

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    /* ---------- Handlers ---------- */

    const selectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setTeacherSearch(teacher.name);
        setSelectedSubject("");
        setShowTeacherList(false);
    };

    const addSubject = () => {
        if (!selectedTeacher || !selectedSubject || !weeklyHours) return;

        setSubjects(prev => [
            ...prev,
            {
                subject: selectedSubject,
                weeklyHours: Number(weeklyHours),
            },
        ]);

        setSelectedSubject("");
        setWeeklyHours("");
    };

    const removeSubject = (index: number) => {
        setSubjects(prev => prev.filter((_, i) => i !== index));
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

    /* ---------- UI ---------- */

    return (
        <form onSubmit={submit} className="space-y-5 text-gray-700">
            {error && (
                <p className="p-2 bg-red-100 text-red-700 rounded">{error}</p>
            )}

            {/* Classroom */}
            <input
                placeholder="Classroom Name"
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl"
            />

            <input
                placeholder="Admin Email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl"
            />

            <input
                placeholder="Department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl"
            />

            {/* ---------- Teacher Search + Shortlist ---------- */}

            <div className="relative">
                <label className="text-sm font-medium">
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
                    className="w-full p-2 border border-gray-300 rounded-xl"
                />

                {showTeacherList && teacherSearch && (
                    <div
                        className="absolute left-0 right-0 mt-1 
                   bg-white border border-gray-300 rounded shadow-lg
                   max-h-52 overflow-y-auto
                   z-[9999]"
                    >
                        {filteredTeachers.length === 0 && (
                            <div className="p-2 text-sm text-gray-400">
                                No teachers found
                            </div>
                        )}

                        {filteredTeachers.map(t => (
                            <div
                                key={t.id}
                                onClick={() => selectTeacher(t)}
                                className="p-2 cursor-pointer hover:bg-blue-100"
                            >
                                {t.name}
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ---------- Subject ---------- */}

            <div className="flex gap-2">
                <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    disabled={!selectedTeacher}
                    className="flex-1 p-2 border border-gray-300 rounded-xl"
                >
                    <option value="" className="rounded-xl">Select Subject</option>
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
                    className="w-24 p-2 border border-gray-300 rounded-xl"
                />

                <button
                    type="button"
                    onClick={addSubject}
                    className="px-4 bg-blue-700 text-white rounded-xl"
                >
                    Add
                </button>
            </div>

            {/* ---------- Added Subjects ---------- */}

            {subjects.map((s, i) => (
                <div
                    key={i}
                    className="flex  overflow-visible justify-between items-center border p-2 rounded"
                >
                    <span>
                        {s.subject} ({s.weeklyHours}h)
                    </span>
                    <button type="button" onClick={() => removeSubject(i)}>
                        ×
                    </button>
                </div>
            ))}

            <button
                disabled={loading}
                className="w-full p-3 bg-blue-700 text-white rounded-xl"
            >
                {loading ? "Creating..." : "Create Classroom"}
            </button>
        </form>
    );
}
