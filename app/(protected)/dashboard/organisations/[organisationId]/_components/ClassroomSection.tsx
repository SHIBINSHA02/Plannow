"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ClassOnboardingModal from "./ClassOnboardingModal";
import { Search, Loader2, Trash2, GraduationCap, Folder } from "lucide-react";

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

type Props = {
    organisationId: string;
};

/* ---------- Component ---------- */

export default function ClassroomSection({ organisationId }: Props) {
    const router = useRouter();

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

            if (!res.ok) {
                throw new Error("Failed to load classrooms");
            }

            const data = await res.json();
            setClassrooms(data.classrooms ?? data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [organisationId]);

    /* ---------- Memoized Search Filtering ---------- */

    const filteredClassrooms = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return classrooms;

        return classrooms.filter(
            (cls) =>
                cls.className.toLowerCase().includes(query) ||
                cls.department?.toLowerCase().includes(query)
        );
    }, [classrooms, search]);

    /* ---------- Render Helpers ---------- */

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading classrooms…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 text-center">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={fetchClassrooms}
                    className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Classrooms
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                        Manage your organisation's class grids and subject layouts.
                    </p>
                </div>

                <ClassOnboardingModal
                    organisationId={organisationId}
                    onClose={fetchClassrooms}
                />
            </div>

            {/* Search Input */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    placeholder="Search classroom by name or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                />
            </div>

            {/* Grid / Empty States */}
            {filteredClassrooms.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        {classrooms.length === 0
                            ? "No classrooms found for this organisation."
                            : "No classrooms match your search parameters."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredClassrooms.map((cls) => (
                        <div
                            key={cls._id}
                            onClick={() =>
                                router.push(
                                    `/dashboard/organisations/${organisationId}/classrooms/${cls.classroomId}/schedule`
                                )
                            }
                            className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-900/60 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                        >
                            {/* Actions Area */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation(); // 🚫 prevent card click from routing

                                        const ok = confirm(`Delete classroom "${cls.className}"?`);
                                        if (!ok) return;

                                        try {
                                            const res = await fetch(
                                                `/api/classrooms/classroom/${cls.classroomId}?organisationId=${organisationId}`,
                                                { method: "DELETE" }
                                            );

                                            if (!res.ok) throw new Error();

                                            // 🔁 Optimistic UI state updates
                                            setClassrooms((prev) => prev.filter((c) => c._id !== cls._id));
                                        } catch {
                                            alert("Failed to delete classroom");
                                        }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    title="Delete classroom"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Core Content */}
                            <div>
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                    <GraduationCap className="w-5 h-5" />
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 pr-8 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {cls.className}
                                </h3>

                                {cls.department && (
                                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <Folder className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{cls.department}</span>
                                    </div>
                                )}
                            </div>

                            {/* Subject Pill Badges */}
                            {cls.subjects?.length ? (
                                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1.5">
                                    {cls.subjects.map((sub, i) => (
                                        <span
                                            key={`${sub.subject}-${i}`}
                                            className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/30"
                                        >
                                            {sub.subject} <span className="text-slate-400 dark:text-slate-500 font-normal">{sub.weeklyHours}h</span>
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