"use client";

import { useEffect, useState } from "react";
import TeacherOnboardingModal from "./TeacherOnboardingModal";
import { useRouter } from "next/navigation";
import TeacherCard, { TeacherSkeleton } from "./TeacherCard";
import { Info } from "lucide-react";

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
        <div className="rounded-xl border border-gray-300 bg-white p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-xl font-semibold">Teachers</h2>
                    <div className="flex items-start gap-2 px-5 py-3 text-xs text-blue-700 bg-blue-50/50 rounded-xl border border-blue-100">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <p>
                            <span className="font-semibold">Note:</span> Make sure to create teacher profiles before setting up classrooms.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
