"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Camera, Upload, User } from "lucide-react";

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

    return (
        <div
            onClick={() => router.push(
                `/dashboard/organisations/${organisationId}/teachers/${teacher.teacherId}/profile`
            )}
            className="group cursor-pointer rounded-xl border border-blue-100 bg-white p-5 space-y-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
        >
            <div className="flex items-start gap-4">
                {/* Avatar / Image Section */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl border-2 border-gray-50 bg-blue-50/30 overflow-hidden flex items-center justify-center group-hover:border-blue-100 transition-all shadow-inner">
                        {teacher.profileImageUrl ? (
                            <img src={teacher.profileImageUrl} alt={teacher.teacherName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-blue-50 text-blue-400">
                                {teacher.teacherName[0]}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {teacher.teacherName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                        {teacher.email}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subject, index) => (
                        <span
                            key={index}
                            className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-600 border border-blue-100"
                        >
                            {subject}
                        </span>
                    ))
                ) : (
                    <span className="text-[10px] text-gray-400 italic">No subjects assigned</span>
                )}
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-mono text-gray-400">
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
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 w-2/3 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="pt-2 border-t border-gray-50">
                <div className="h-3 w-24 bg-gray-50 rounded" />
            </div>
        </div>
    );
}
