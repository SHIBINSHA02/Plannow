"use client";

import { useEffect, useState } from "react";
import TeacherOnboardingModal from "./TeacherOnboardingModal";

type Teacher = {
    _id: string;
    name: string;
    email: string;
    subjects: string[];
    imageUrl?: string | null;
};

export default function TeachersSection() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/api/organisation/teachers", { cache: "no-store" })
            .then(res => res.json())
            .then(data => setTeachers(data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="rounded-xl border border-gray-300 bg-white p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Teachers</h2>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                    + Create Teacher
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search teachers by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-black"
            />

            {/* Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && <p className="text-sm text-gray-500">Loading teachers...</p>}

                {!loading &&
                    teachers
                        .filter(t =>
                            t.name.toLowerCase().includes(search.toLowerCase()) ||
                            t.email.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(t => (
                            <div
                                key={t._id}
                                className="rounded-xl border p-4 space-y-2 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={t.imageUrl || "/avatar.png"}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />

                                    <div>
                                        <p className="font-medium">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {t.subjects.map((s, i) => (
                                        <span
                                            key={i}
                                            className="rounded-md bg-gray-100 px-2 py-1 text-xs"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
            </div>

            <TeacherOnboardingModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
}
