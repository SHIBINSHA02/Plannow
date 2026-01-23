"use client";

import { useEffect, useState } from "react";
import TeacherOnboardingModal from "./TeacherOnboardingModal";
import { useRouter } from "next/navigation";

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

    const router = useRouter();


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
                <h2 className="text-xl font-semibold">Teachers</h2>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && (
                    <p className="text-sm text-gray-500">
                        Loading teachers...
                    </p>
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
                            <div
                                key={t._id}
                                onClick={() => router.push(
                                    `/dashboard/organisations/${organisationId}/teachers/${t.teacherId}/profile`
                                )}
                                className="rounded-xl border border-blue-100 shadow-xl shadow-blue-50 p-4 space-y-3 hover:shadow-sm"
                            >
                                <div>
                                    <p className="font-semibold text-lg">
                                        {t.teacherName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t.email}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {t.subjects.map((s, i) => (
                                        <span
                                            key={i}
                                            className="rounded-md bg-gray-100 px-2 py-1 text-xs"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400">
                                    Teacher ID: {t.teacherId}
                                </p>
                            </div>
                        ))}
            </div>
        </div>
    );
}
