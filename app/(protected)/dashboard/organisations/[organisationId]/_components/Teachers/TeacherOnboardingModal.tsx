"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Camera, X as LucideX, Upload } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

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
    const { theme } = useTheme();
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div
                className={`w-full max-w-lg rounded-xl p-6 space-y-6 border shadow-2xl transition-all duration-200
                    ${theme === "light"
                        ? "bg-white border-gray-200 text-gray-900"
                        : "bg-[#0f172a] border-slate-800 text-slate-100"}`}
            >
                <h2 className="text-xl font-semibold tracking-tight">
                    Create Teacher Profile
                </h2>

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="relative group">
                        <div
                            className={`w-24 h-24 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-400
                                ${theme === "light"
                                    ? "border-gray-200 bg-gray-50"
                                    : "border-slate-800 bg-slate-900"}`}
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className={`w-8 h-8 transition-colors ${theme === "light" ? "text-gray-300 group-hover:text-blue-400" : "text-slate-700 group-hover:text-blue-400"}`} />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`absolute -bottom-2 -right-2 p-2 rounded-lg shadow-md border transition-all transform hover:scale-105 active:scale-95
                                ${theme === "light"
                                    ? "bg-white text-blue-600 border-blue-50 hover:bg-blue-600 hover:text-white"
                                    : "bg-slate-800 text-blue-400 border-slate-700 hover:bg-blue-600 hover:text-white"}`}
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        {profileImage && (
                            <button
                                type="button"
                                onClick={() => setProfileImage(null)}
                                className={`absolute -top-2 -right-2 p-1 rounded-full shadow-sm border transition-all
                                    ${theme === "light"
                                        ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white"
                                        : "bg-red-950/40 text-red-400 border-red-900/30 hover:bg-red-500 hover:text-white"}`}
                            >
                                <LucideX className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <p className={`text-[10px] font-medium ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                        Add profile photo (optional)
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <input
                        placeholder="Teacher name"
                        value={teacherName}
                        onChange={e => setTeacherName(e.target.value)}
                        className={`w-full border px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:border-blue-500 focus:ring-blue-500
                            ${theme === "light"
                                ? "border-gray-200 bg-white text-gray-900"
                                : "border-slate-800 bg-slate-900 text-slate-100"}`}
                    />

                    <input
                        placeholder="Teacher email"
                        value={teacherEmail}
                        onChange={e => setTeacherEmail(e.target.value)}
                        className={`w-full border px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:border-blue-500 focus:ring-blue-500
                            ${theme === "light"
                                ? "border-gray-200 bg-white text-gray-900"
                                : "border-slate-800 bg-slate-900 text-slate-100"}`}
                    />

                    <div className="flex gap-2">
                        <input
                            placeholder="Add subject"
                            value={subjectInput}
                            onChange={e => setSubjectInput(e.target.value)}
                            className={`flex-1 border px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-1 focus:border-blue-500 focus:ring-blue-500
                                ${theme === "light"
                                    ? "border-gray-200 bg-white text-gray-900"
                                    : "border-slate-800 bg-slate-900 text-slate-100"}`}
                        />
                        <button
                            onClick={addSubject}
                            className={`px-4 rounded-lg text-sm font-medium transition-all active:scale-95
                                ${theme === "light"
                                    ? "bg-black text-white hover:bg-neutral-800"
                                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Subjects Tags */}
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {subjects.map(s => (
                        <span
                            key={s}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 border
                                ${theme === "light"
                                    ? "bg-gray-50 border-gray-200 text-gray-700"
                                    : "bg-slate-900 border-slate-800 text-slate-300"}`}
                        >
                            {s}
                            <button
                                type="button"
                                onClick={() => removeSubject(s)}
                                className={`transition-colors text-lg line-none leading-none
                                    ${theme === "light" ? "text-gray-400 hover:text-red-500" : "text-slate-500 hover:text-red-400"}`}
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={submitTeacher}
                        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98]
                            ${theme === "light"
                                ? "bg-black text-white hover:bg-neutral-800"
                                : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                    >
                        Create Teacher
                    </button>

                    <hr className={theme === "light" ? "border-gray-200" : "border-slate-800"} />

                    {/* CSV Upload Zone */}
                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={e => setCsvFile(e.target.files?.[0] || null)}
                            className={`w-full text-xs rounded-lg border p-2
                                ${theme === "light"
                                    ? "border-gray-200 text-gray-600 bg-gray-50/50"
                                    : "border-slate-800 text-slate-400 bg-slate-900/50"}`}
                        />

                        <button
                            onClick={handleCSV}
                            disabled={uploading}
                            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50
                                ${theme === "light"
                                    ? "bg-gray-800 text-white hover:bg-gray-900"
                                    : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"}`}
                        >
                            {uploading ? "Uploading..." : "Upload CSV"}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full pt-2 text-sm font-medium transition-colors
                            ${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}