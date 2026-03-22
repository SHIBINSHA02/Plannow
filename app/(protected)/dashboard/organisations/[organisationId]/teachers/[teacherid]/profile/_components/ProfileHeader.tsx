"use client";

import { useState, useRef } from "react";
import { Mail, Building2, Camera, Upload, X } from "lucide-react";
import EditTeacherModal from "./EditTeacherModal";

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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile Image Section */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gray-50 overflow-hidden shadow-lg flex items-center justify-center transition-all group-hover:border-blue-100">
                        {currentImage ? (
                            <img src={currentImage} alt={teacher.teacherName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-blue-50 text-blue-400">
                                {teacher.teacherName[0]}
                            </div>
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-white text-blue-600 rounded-lg shadow-md border border-blue-50 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
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
                            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                {teacher.teacherName}
                            </h1>
                            <p className="text-blue-600 font-medium text-sm">Professional Educator</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 pt-2">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <Mail className="size-4 text-blue-400" />
                                {teacher.email}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 font-mono">
                                <Building2 className="size-4 text-blue-400" />
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
                                        className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-100 uppercase tracking-wider"
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
