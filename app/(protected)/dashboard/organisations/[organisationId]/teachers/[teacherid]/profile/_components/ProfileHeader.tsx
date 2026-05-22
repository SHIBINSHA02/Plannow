"use client";

import { useState, useRef } from "react";
import { Mail, Building2, Camera } from "lucide-react";
import EditTeacherModal from "./EditTeacherModal";
import { useTheme } from "@/app/theme-provider";

type Teacher = {
    teacherId: string;
    teacherName: string;
    email: string;
    subjects: string[];
    profileImageUrl?: string;
};

type Props = {
    teacher: Teacher;
    organisationId: string;
};

export default function ProfileHeader({ teacher, organisationId }: Props) {
    const { theme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [currentImage, setCurrentImage] = useState(teacher.profileImageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch("/api/teachers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        teacherId: teacher.teacherId,
                        profileImageUrl: base64,
                        organisationId: organisationId
                    }),
                });

                if (res.ok) {
                    setCurrentImage(base64);
                }
            } catch (err) {
                console.error("Failed to upload teacher image:", err);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className={`border rounded-lg shadow-sm p-6 sm:p-8 transition-colors duration-300
            ${theme === "light"
                    ? "bg-white border-gray-200 shadow-blue-700/5"
                    : "bg-[#0d1527] border-gray-800 shadow-none"}
        `}
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile Image Section */}
                <div className="relative group">
                    <div
                        className={`w-32 h-32 rounded-2xl border-4 overflow-hidden shadow-lg flex items-center justify-center transition-all duration-300
                        ${theme === "light"
                                ? "border-white bg-gray-50 group-hover:border-blue-100"
                                : "border-[#1e293b] bg-[#090f1c] group-hover:border-blue-950"}
                    `}
                    >
                        {currentImage ? (
                            <img src={currentImage} alt={teacher.teacherName} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center justify-center text-4xl font-bold transition-colors duration-300
                                ${theme === "light" ? "bg-blue-50 text-blue-400" : "bg-blue-950/40 text-blue-500"}
                            `}
                            >
                                {teacher.teacherName[0]}
                            </div>
                        )}

                        {uploading && (
                            <div
                                className={`absolute inset-0 flex items-center justify-center transition-colors duration-300
                                ${theme === "light" ? "bg-white/60" : "bg-[#020817]/60"}
                            `}
                            >
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute -bottom-2 -right-2 p-2 rounded-lg shadow-md border transition-all transform hover:scale-110 duration-300
                        ${theme === "light"
                                ? "bg-white text-blue-600 border-blue-50 hover:bg-blue-600 hover:text-white"
                                : "bg-[#16223f] text-blue-400 border-gray-800 hover:bg-blue-600 hover:text-white"}
                    `}
                        title="Change photo"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="space-y-1">
                            <h1
                                className={`text-2xl sm:text-4xl font-bold tracking-tight transition-colors duration-300
                                ${theme === "light" ? "text-gray-900" : "text-gray-100"}
                            `}
                            >
                                {teacher.teacherName}
                            </h1>
                            <p className="text-blue-500 font-medium text-sm">Professional Educator</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm pt-2">
                            <span
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors duration-300
                                ${theme === "light"
                                        ? "bg-gray-50 text-gray-600 border-gray-100"
                                        : "bg-[#090f1c] text-gray-300 border-gray-800"}
                            `}
                            >
                                <Mail className="size-4 text-blue-500" />
                                {teacher.email}
                            </span>
                            <span
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono transition-colors duration-300
                                ${theme === "light"
                                        ? "bg-gray-50 text-gray-600 border-gray-100"
                                        : "bg-[#090f1c] text-gray-300 border-gray-800"}
                            `}
                            >
                                <Building2 className="size-4 text-blue-500" />
                                {teacher.teacherId}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-4 mt-2 sm:mt-0">
                        <EditTeacherModal
                            teacher={{
                                teacherName: teacher.teacherName,
                                email: teacher.email,
                                teacherId: teacher.teacherId,
                                subjects: teacher.subjects || [],
                            }}
                            organisationId={organisationId}
                        />

                        {teacher.subjects?.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                                {teacher.subjects.map((s: string) => (
                                    <span
                                        key={s}
                                        className={`px-3 py-1 text-[11px] font-semibold rounded-md border uppercase tracking-wider transition-colors duration-300
                                        ${theme === "light"
                                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                                : "bg-blue-950/40 text-blue-400 border-blue-900/60"}
                                    `}
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}