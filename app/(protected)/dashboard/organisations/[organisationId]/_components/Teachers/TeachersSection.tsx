"use client";

import { useEffect, useState } from "react";
import TeacherOnboardingModal from "./TeacherOnboardingModal";
import { useRouter } from "next/navigation";
import TeacherCard, { TeacherSkeleton } from "./TeacherCard";
import { Info } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

/* ---------- Types ---------- */

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    email: string;
    subjects: string[];
};

type Props = {
    organisationId: string;
};

/* ---------- Component ---------- */

export default function TeachersSection({ organisationId }: Props) {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        if (!organisationId) return;

        setLoading(true);

        const res = await fetch(
            `/api/teachers?organisationId=${organisationId}`,
            { cache: "no-store" }
        );

        const data = await res.json();
        setTeachers(data.teachers ?? data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTeachers();
    }, [organisationId]);

    return (
        <div
            className={`rounded-xl border p-6 space-y-5 transition-all duration-200
                ${theme === "light"
                    ? "border-gray-300 bg-white"
                    : "border-slate-800 bg-[#0f172a]"}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2
                        className={`text-xl font-semibold tracking-tight
                            ${theme === "light" ? "text-gray-900" : "text-slate-100"}`}
                    >
                        Teachers
                    </h2>
                    <div
                        className={`flex items-start gap-2 px-5 py-3 text-xs border rounded-xl
                            ${theme === "light"
                                ? "text-blue-700 bg-blue-50/50 border-blue-100"
                                : "text-blue-400 bg-blue-950/20 border-blue-900/30"}`}
                    >
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <p>
                            <span className="font-semibold">Note:</span> Make sure to create teacher profiles before setting up classrooms.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className={`rounded-lg px-4 py-2 text-sm transition-all active:scale-95 font-medium
                        ${theme === "light"
                            ? "bg-black text-white hover:bg-neutral-800"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                >
                    + Create Teacher
                </button>

                <TeacherOnboardingModal
                    organisationId={organisationId}
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        fetchTeachers();
                    }}
                />
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-1
                    ${theme === "light"
                        ? "border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        : "border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500 focus:ring-blue-500"}`}
            />

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                    <>
                        <TeacherSkeleton />
                        <TeacherSkeleton />
                        <TeacherSkeleton />
                    </>
                )}

                {!loading &&
                    teachers
                        .filter(
                            t =>
                                t.teacherName
                                    .toLowerCase()
                                    .includes(search.toLowerCase()) ||
                                t.email
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                        )
                        .map(t => (
                            <TeacherCard
                                key={t._id}
                                teacher={t}
                                organisationId={organisationId}
                            />
                        ))}
            </div>
        </div>
    );
}