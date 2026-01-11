"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Subject = {
    _id: string;
    subject: string;
    defaultTeacherId: string;
    weeklyHours: number;
};

type Classroom = {
    _id: string;
    classroomId: string;
    className: string;
    department?: string;
    subjects?: Subject[];
};



export default function ClassroomGrid() {
    const params = useParams();
    const organisationId = params?.organisationId as string;

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!organisationId) return;

        fetch(`/api/classrooms?organisationId=${organisationId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load classrooms");
                }
                return res.json();
            })
            .then((data) => {
                setClassrooms(data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [organisationId]);



    if (!organisationId) {
        return (
            <p className="text-red-500">
                Organisation ID not found in route
            </p>
        );
    }

    if (loading) return <p>Loading classrooms…</p>;

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (classrooms.length === 0) {
        return <p className="text-gray-400">No classrooms found</p>;
    }



    return (
        <div className="grid md:grid-cols-3 gap-5">
            {classrooms.map((cls) => (
                <div
                    key={cls._id}
                    className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition"
                >
                    {/* Classroom name */}
                    <h3 className="font-semibold text-lg">
                        {cls.className}
                    </h3>

                    {/* Department */}
                    {cls.department && (
                        <p className="text-sm text-gray-500 mt-1">
                            Dept: {cls.department}
                        </p>
                    )}

                    {/* Subjects */}
                    {cls.subjects && cls.subjects.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-1">
                                Subjects
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {cls.subjects.map((sub) => (
                                    <span
                                        key={sub._id}
                                        className="px-2 py-1 text-xs bg-gray-100 rounded"
                                    >
                                        {sub.subject} ({sub.weeklyHours}h)
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
