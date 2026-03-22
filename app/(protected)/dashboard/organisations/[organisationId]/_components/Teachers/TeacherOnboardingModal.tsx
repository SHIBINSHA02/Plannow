"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Camera, X as LucideX, Upload } from "lucide-react";

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
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    /* ---------- Helpers ---------- */

    const addSubject = () => {
        if (!subjectInput.trim()) return;

        setSubjects(prev =>
            [...new Set([...prev, subjectInput.trim()])]
        );
        setSubjectInput("");
    };

    const removeSubject = (subjectToRemove: string) => {
        setSubjects(prev => prev.filter(s => s !== subjectToRemove));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);
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
                profileImageUrl: profileImage,
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

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 py-2">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-300">
                            {profileImage ? (
                                <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-gray-300 group-hover:text-blue-400" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 bg-white text-blue-600 rounded-lg shadow-md border border-blue-50 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        {profileImage && (
                            <button
                                type="button"
                                onClick={() => setProfileImage(null)}
                                className="absolute -top-2 -right-2 p-1 bg-red-50 text-red-500 rounded-full shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <LucideX className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Add profile photo (optional)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

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
                            className="bg-gray-100 px-2 py-1 text-xs rounded-md flex items-center gap-1"
                        >
                            {s}
                            <button
                                type="button"
                                onClick={() => removeSubject(s)}
                                className="text-gray-500 hover:text-red-500 ml-1"
                            >
                                &times;
                            </button>
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
