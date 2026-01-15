"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function ClassroomGrid() {
    const router = useRouter();
    const params = useParams();

    const organisationId = params.organisationId as string;

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Fetch classrooms ---------- */

    useEffect(() => {
        const loadClassrooms = async () => {
            try {
                const res = await fetch(
                    `/api/classrooms?organisationId=${organisationId}`
                );

                if (!res.ok) {
                    throw new Error("Failed to load classrooms");
                }

                const data: Classroom[] = await res.json();
                setClassrooms(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (organisationId) {
            loadClassrooms();
        }
    }, [organisationId]);

    /* ---------- States ---------- */

    if (loading) {
        return <p className="text-gray-500">Loading classrooms…</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (classrooms.length === 0) {
        return (
            <p className="text-gray-400">
                No classrooms found for this organisation
            </p>
        );
    }

    /* ---------- Render ---------- */

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classrooms.map((cls) => (
                <div
                    key={cls._id}
                    onClick={() =>
                        router.push(
                            `/dashboard/organisations/${organisationId}/classrooms/${cls.classroomId}/schedule`
                        )
                    }
                    className="
                        p-5 bg-white rounded-xl shadow cursor-pointer
                        hover:shadow-lg hover:-translate-y-0.5
                        transition-all duration-200
                    "
                >
                    {/* Classroom Name */}
                    <h3 className="font-semibold text-lg">
                        {cls.className}
                    </h3>

                    {/* Department */}
                    {cls.department && (
                        <p className="mt-1 text-sm text-gray-500">
                            Dept: {cls.department}
                        </p>
                    )}

                    {/* Subjects (optional display) */}
                    {cls.subjects && cls.subjects.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {cls.subjects.map((sub, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                                >
                                    {sub.subject} ({sub.weeklyHours}h)
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
