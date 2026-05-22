"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SlotInfo } from "./SubstitutionWorkspace";
import { useTheme } from "@/app/theme-provider";

type Teacher = {
    teacherId: string;
    teacherName: string;
    subjects?: string[];
};

type Props = {
    slot: SlotInfo;
    organisationId: string;
    onClose: () => void;
    onCreated: () => void;
    teachersMap?: Record<string, string>;
};

export default function SlotAssignModal({
    slot,
    organisationId,
    onClose,
    onCreated,
    teachersMap = {},
}: Props) {
    const { theme } = useTheme();
    const [teachers, setTeachers] = useState<{
        inDepartment: Teacher[];
        others: Teacher[];
    }>({ inDepartment: [], others: [] });
    const [loading, setLoading] = useState(true);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const url = `/api/substitution/teachers?organisationId=${organisationId}&classroomId=${slot.classroomId || ""}`;
        fetch(url)
            .then((r) => r.json())
            .then(setTeachers)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [organisationId, slot.classroomId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacherId) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/substitution", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organisationId,
                    slotId: slot.slotId,
                    classroomId: slot.classroomId,
                    day: slot.day,
                    period: slot.period,
                    subject: slot.subject,
                    originalTeacherId: slot.teacherId,
                    requestedTeacherId: selectedTeacherId,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Failed to create request");
            }
            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const dayLabel = dayNames[slot.day - 1] ?? `Day ${slot.day}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} aria-hidden />

            <div className={`relative rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden transition-colors duration-200 ${theme === "light" ? "bg-white" : "bg-[#0f172a] border border-slate-800"
                }`}>
                <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === "light" ? "border-slate-100" : "border-slate-800"
                    }`}>
                    <h3 className={`font-semibold ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                        Request substitution
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-1 rounded-full transition-colors ${theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
                            }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={`px-6 py-4 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                    <p>
                        {slot.className} · {dayLabel} · P{slot.period}
                        {slot.subject && ` · ${slot.subject}`}
                    </p>
                    {slot.teacherId && (
                        <p className="mt-1">
                            Current:{" "}
                            <span className={`font-medium ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                                {teachersMap[slot.teacherId] ?? slot.teacherId}
                            </span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6">
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                        Assign to teacher
                    </label>
                    {loading ? (
                        <div className={`h-10 rounded-xl animate-pulse ${theme === "light" ? "bg-slate-100" : "bg-slate-800"}`} />
                    ) : (
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            required
                            className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 outline-none mb-6 transition-colors ${theme === "light"
                                    ? "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                                    : "bg-[#1e293b] border-slate-700 text-white focus:ring-blue-500"
                                }`}
                        >
                            <option value="">Select teacher</option>
                            {teachers.inDepartment.filter(t => t.teacherId !== slot.teacherId).length > 0 && (
                                <optgroup label="Same department (priority)">
                                    {teachers.inDepartment.filter((t) => t.teacherId !== slot.teacherId).map((t) => (
                                        <option key={t.teacherId} value={t.teacherId}>
                                            {t.teacherName} {t.subjects?.length ? ` (${t.subjects.join(", ")})` : ""}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {teachers.others.filter(t => t.teacherId !== slot.teacherId).length > 0 && (
                                <optgroup label="Other teachers">
                                    {teachers.others.filter((t) => t.teacherId !== slot.teacherId).map((t) => (
                                        <option key={t.teacherId} value={t.teacherId}>
                                            {t.teacherName} {t.subjects?.length ? ` (${t.subjects.join(", ")})` : ""}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${theme === "light" ? "text-slate-600 hover:bg-slate-100" : "text-slate-400 hover:bg-slate-800"
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedTeacherId || submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? "Creating…" : "Create request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}