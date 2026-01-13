"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function ClassroomGrid() {
    const router = useRouter();
    const params = useParams();
    const organisationId = params.organisationId as string;

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/classrooms?organisationId=${organisationId}`)
            .then((res) => res.json())
            .then(setClassrooms)
            .finally(() => setLoading(false));
    }, [organisationId]);

    if (loading) return <p>Loading classrooms…</p>;

    return (
        <div className="grid md:grid-cols-3 gap-5">
            {classrooms.map((cls) => (
                <div
                    key={cls._id}
                    onClick={() =>
                        router.push(
                            `/dashboard/organisations/${organisationId}/classrooms/${cls.classroomId}/schedule`
                        )
                    }
                    className="p-5 bg-white rounded-xl shadow cursor-pointer
                               hover:shadow-lg transition"
                >
                    <h3 className="font-semibold text-lg">
                        {cls.className}
                    </h3>

                    {cls.department && (
                        <p className="text-sm text-gray-500">
                            Dept: {cls.department}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
