"use client";

import { useState } from "react";
import Papa from "papaparse";

/* ---------- Props ---------- */

type Props = {
    organisationId: string;
    open: boolean;
    onClose: () => void;
};

/* ---------- Component ---------- */

export default function TeacherOnboardingModal({
    organisationId,
    open,
    onClose,
}: Props) {
    const [teacherName, setTeacherName] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [subjectInput, setSubjectInput] = useState("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!open) return null;

    /* ---------- Helpers ---------- */

    const addSubject = () => {
        if (!subjectInput.trim()) return;

        setSubjects(prev =>
            [...new Set([...prev, subjectInput.trim()])]
        );
        setSubjectInput("");
    };

    /* ---------- Create single teacher ---------- */

    const submitTeacher = async () => {
        if (!teacherName || !teacherEmail || subjects.length === 0) return;

        await fetch("/api/teachers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                organisationId,
                teacherName,
                email: teacherEmail,
                subjects,
            }),
        });

        onClose();
    };

    /* ---------- CSV upload ---------- */

    const handleCSV = () => {
        if (!csvFile) return;

        setUploading(true);

        Papa.parse(csvFile, {
            header: true,
            complete: async ({ data }: any) => {
                for (const row of data) {
                    if (!row.teachername || !row.mailid) continue;

                    await fetch("/api/teachers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            organisationId,
                            teacherName: row.teachername,
                            email: row.mailid,
                            subjects: row.subjects?.split(",") || [],
                        }),
                    });
                }

                setUploading(false);
                onClose();
            },
        });
    };

    /* ---------- UI ---------- */

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 space-y-6">
                <h2 className="text-xl font-semibold">
                    Create Teacher Profile
                </h2>

                <input
                    placeholder="Teacher name"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md"
                />

                <input
                    placeholder="Teacher email"
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md"
                />

                <div className="flex gap-2">
                    <input
                        placeholder="Add subject"
                        value={subjectInput}
                        onChange={e => setSubjectInput(e.target.value)}
                        className="flex-1 border px-3 py-2 rounded-md"
                    />
                    <button
                        onClick={addSubject}
                        className="px-3 bg-black text-white rounded-md"
                    >
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {subjects.map(s => (
                        <span
                            key={s}
                            className="bg-gray-100 px-2 py-1 text-xs rounded-md"
                        >
                            {s}
                        </span>
                    ))}
                </div>

                <button
                    onClick={submitTeacher}
                    className="w-full py-2 bg-black text-white rounded-lg"
                >
                    Create Teacher
                </button>

                <hr />

                <input
                    type="file"
                    accept=".csv"
                    onChange={e =>
                        setCsvFile(e.target.files?.[0] || null)
                    }
                />

                <button
                    onClick={handleCSV}
                    disabled={uploading}
                    className="w-full py-2 bg-gray-800 text-white rounded-lg"
                >
                    {uploading ? "Uploading..." : "Upload CSV"}
                </button>

                <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
