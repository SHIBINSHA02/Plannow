"use client";

import { useRouter } from "next/navigation";
import { Camera, Upload, User } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    email: string;
    subjects: string[];
    profileImageUrl?: string;
};

interface TeacherCardProps {
    teacher: Teacher;
    organisationId: string;
}

export default function TeacherCard({ teacher, organisationId }: TeacherCardProps) {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <div
            onClick={() => router.push(
                `/dashboard/organisations/${organisationId}/teachers/${teacher.teacherId}/profile`
            )}
            className={`group cursor-pointer rounded-xl p-5 space-y-4 shadow-sm transition-all duration-200 border
                ${theme === "light"
                    ? "border-blue-100 bg-white hover:shadow-md hover:border-blue-200"
                    : "border-slate-800 bg-slate-900/50 hover:shadow-md hover:border-slate-700/80 hover:bg-slate-900"}`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar / Image Section */}
                <div className="relative flex-shrink-0">
                    <div
                        className={`w-16 h-16 rounded-2xl border overflow-hidden flex items-center justify-center transition-all shadow-inner
                            ${theme === "light"
                                ? "border-gray-50 bg-blue-50/30 group-hover:border-blue-100"
                                : "border-slate-800 bg-slate-950 group-hover:border-slate-700"}`}
                    >
                        {teacher.profileImageUrl ? (
                            <img src={teacher.profileImageUrl} alt={teacher.teacherName} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center justify-center text-xl font-bold
                                    ${theme === "light"
                                        ? "bg-blue-50 text-blue-400"
                                        : "bg-blue-950/40 text-blue-400"}`}
                            >
                                {teacher.teacherName[0]}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                    <h3
                        className={`font-semibold text-lg transition-colors truncate
                            ${theme === "light"
                                ? "text-gray-900 group-hover:text-blue-600"
                                : "text-slate-100 group-hover:text-blue-400"}`}
                    >
                        {teacher.teacherName}
                    </h3>
                    <p className={`text-sm truncate ${theme === "light" ? "text-gray-500" : "text-slate-400"}`}>
                        {teacher.email}
                    </p>
                </div>
            </div>

            {/* Subjects Tags */}
            <div className="flex flex-wrap gap-2">
                {teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subject, index) => (
                        <span
                            key={index}
                            className={`rounded-full px-3 py-1 text-[10px] font-medium border
                                ${theme === "light"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-blue-950/30 text-blue-400 border-blue-900/30"}`}
                        >
                            {subject}
                        </span>
                    ))
                ) : (
                    <span className={`text-[10px] italic ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                        No subjects assigned
                    </span>
                )}
            </div>

            {/* Card Footer */}
            <div className={`pt-2 border-t flex items-center justify-between ${theme === "light" ? "border-gray-50" : "border-slate-800/60"}`}>
                <p className={`text-[10px] font-mono ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                    ID: {teacher.teacherId}
                </p>
                <div className="text-[10px] font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile →
                </div>
            </div>
        </div>
    );
}

export function TeacherSkeleton() {
    const { theme } = useTheme();

    return (
        <div
            className={`rounded-xl border p-5 space-y-4 animate-pulse
                ${theme === "light"
                    ? "border-gray-100 bg-white"
                    : "border-slate-800/60 bg-slate-900/30"}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl ${theme === "light" ? "bg-gray-100" : "bg-slate-800"}`} />
                <div className="flex-1 space-y-2 py-1">
                    <div className={`h-5 w-2/3 rounded ${theme === "light" ? "bg-gray-200" : "bg-slate-800"}`} />
                    <div className={`h-4 w-1/2 rounded ${theme === "light" ? "bg-gray-100" : "bg-slate-800/50"}`} />
                </div>
            </div>
            <div className="flex gap-2">
                <div className={`h-6 w-16 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-slate-800"}`} />
                <div className={`h-6 w-20 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-slate-800"}`} />
            </div>
            <div className={`pt-2 border-t ${theme === "light" ? "border-gray-50" : "border-slate-800/60"}`}>
                <div className={`h-3 w-24 rounded ${theme === "light" ? "bg-gray-50" : "bg-slate-800/40"}`} />
            </div>
        </div>
    );
}