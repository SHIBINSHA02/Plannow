"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassOnboardingModal from "./ClassOnboardingModal";

/* ---------- Types ---------- */

type Subject = {
    subject: string;
    weeklyHours: number;
};

type Classroom = {
    _id: string;
    classroomId: string;
    className: string;
    department?: string;
    subjects?: Subject[];
};

/* ---------- Component ---------- */

export default function ClassroomSection() {
    const router = useRouter();
    const params = useParams();
    const organisationId = params.organisationId as string;

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Fetch classrooms ---------- */

    const fetchClassrooms = async () => {
        if (!organisationId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/classrooms?organisationId=${organisationId}`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error("Failed to load classrooms");

            const data: Classroom[] = await res.json();
            setClassrooms(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [organisationId]);

    /* ---------- States ---------- */

    if (loading) {
        return <p className="text-gray-500">Loading classrooms…</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="rounded-xl border border-gray-300 bg-white p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Classrooms</h2>

                <ClassOnboardingModal
                    onClose={() => fetchClassrooms()} 
                />
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search classroom by name or department"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
            />

            {/* Grid */}
            {classrooms.length === 0 ? (
                <p className="text-gray-400">
                    No classrooms found for this organisation
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {classrooms
                        .filter(cls =>
                            cls.className
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                            cls.department
                                ?.toLowerCase()
                                .includes(search.toLowerCase())
                        )
                        .map((cls) => (
                            <div
                                key={cls._id}
                                onClick={() =>
                                    router.push(
                                        `/dashboard/organisations/${organisationId}/classrooms/${cls.classroomId}/schedule`
                                    )
                                }
                                className="
                                    p-5 bg-white rounded-xl border border-blue-100
                                    shadow-lg shadow-blue-50 hover:shadow cursor-pointer
                                    transition-all
                                "
                            >
                                <h3 className="font-semibold text-lg">
                                    {cls.className}
                                </h3>

                                {cls.department && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Dept: {cls.department}
                                    </p>
                                )}

                                {cls.subjects?.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {cls.subjects.map((sub, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs rounded bg-gray-100"
                                            >
                                                {sub.subject} ({sub.weeklyHours}h)
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
