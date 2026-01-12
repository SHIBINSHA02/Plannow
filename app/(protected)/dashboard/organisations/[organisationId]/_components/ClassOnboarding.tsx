"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

type SubjectInput = {
    subject: string;
    weeklyHours: number;
};

export default function ClassOnboarding({
    onSuccess,
}: {
    onSuccess?: () => void;
}) {
    const params = useParams();
    const organisationId = params?.organisationId as string;

    const [className, setClassName] = useState("");
    const [department, setDepartment] = useState("");
    const [adminEmail, setAdminEmail] = useState(""); 
    const [subjects, setSubjects] = useState<SubjectInput[]>([]);

    const [subjectName, setSubjectName] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addSubject = () => {
        if (!subjectName || !weeklyHours) return;

        setSubjects(prev => [
            ...prev,
            { subject: subjectName, weeklyHours: Number(weeklyHours) },
        ]);

        setSubjectName("");
        setWeeklyHours("");
    };

    const removeSubject = (index: number) => {
        setSubjects(prev => prev.filter((_, i) => i !== index));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!className || !adminEmail || subjects.length === 0) {
            setError("Class name, admin email & at least one subject required");
            return;
        }

        const classroomId =
            className.toUpperCase().replace(/[^A-Z0-9]/g, "-") +
            "-" +
            Date.now();

        try {
            setLoading(true);

            const res = await fetch("/api/classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organisationId,
                    classroomId,
                    className,
                    department,
                    adminEmail, 
                    subjects,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to create classroom");
                return;
            }

            // reset
            setClassName("");
            setDepartment("");
            setAdminEmail("");
            setSubjects([]);

            onSuccess?.();
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5 text-gray-700">
            {error && (
                <p className="p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </p>
            )}

            {/* Classroom name */}
            <div>
                <label className="block text-sm font-medium">
                    Classroom Name
                </label>
                <input
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className="w-full p-2 border border-gray-200 my-3 rounded"
                    placeholder="e.g. CS-A"
                />
            </div>

            {/* Admin email */}
            <div>
                <label className="block text-sm font-medium">
                    Admin Email
                </label>
                <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded"
                    placeholder="admin@college.edu"
                />
            </div>

            {/* Department */}
            <div>
                <label className="block text-sm font-medium">
                    Department (optional)
                </label>
                <input
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded"
                    placeholder="Computer Science"
                />
            </div>

            {/* Subjects */}
            <div className="border border-gray-200 my-3 rounded p-3">
                <p className="text-sm font-medium mb-2">
                    Add Subject
                </p>

                <div className="flex gap-2 mb-2">
                    <input
                        value={subjectName}
                        onChange={e => setSubjectName(e.target.value)}
                        placeholder="Subject"
                        className="flex-1 p-2 border border-gray-200 rounded"
                    />
                    <input
                        type="number"
                        value={weeklyHours}
                        onChange={e => setWeeklyHours(e.target.value)}
                        placeholder="Hours"
                        className="w-24 p-2 border border-gray-200 rounded"
                    />
                    <button
                        type="button"
                        onClick={addSubject}
                        className="px-4 bg-indigo-600 text-white rounded"
                    >
                        Add
                    </button>
                </div>

                {subjects.map((s, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center p-2 border border-green-200 my-3 rounded"
                    >
                        <span>
                            {s.subject} ({s.weeklyHours}h)
                        </span>
                        <button
                            type="button"
                            onClick={() => removeSubject(i)}
                            className="text-xl"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <button
                disabled={loading}
                className="w-full p-3 bg-indigo-600 text-white rounded"
            >
                {loading ? "Creating..." : "Create Classroom"}
            </button>
        </form>
    );
}
