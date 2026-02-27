"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SlotInfo } from "./SubstitutionWorkspace";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">
                        Request substitution
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 py-3 text-sm text-gray-600">
                    <p>
                        {slot.className} · {dayLabel} · P{slot.period}
                        {slot.subject && ` · ${slot.subject}`}
                    </p>
                    {slot.teacherId && (
                        <p className="text-gray-500 mt-1">
                            Current:{" "}
                            <span className="font-medium text-gray-700">
                                {teachersMap[slot.teacherId] ?? slot.teacherId}
                            </span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="px-4 pb-4">
                    {error && (
                        <p className="text-red-500 text-sm mb-3">{error}</p>
                    )}

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to teacher
                    </label>
                    {loading ? (
                        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <select
                            value={selectedTeacherId}
                            onChange={(e) =>
                                setSelectedTeacherId(e.target.value)
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                        >
                            <option value="">Select teacher</option>
                            {teachers.inDepartment.filter(t => t.teacherId !== slot.teacherId).length > 0 && (
                                <optgroup label="Same department (priority)">
                                    {teachers.inDepartment
                                        .filter((t) => t.teacherId !== slot.teacherId)
                                        .map((t) => (
                                            <option
                                                key={t.teacherId}
                                                value={t.teacherId}
                                            >
                                                {t.teacherName}
                                                {t.subjects?.length ? ` (${t.subjects.join(", ")})` : ""}
                                            </option>
                                        ))}
                                </optgroup>
                            )}
                            {teachers.others.filter(t => t.teacherId !== slot.teacherId).length > 0 && (
                                <optgroup label="Other teachers in organisation">
                                    {teachers.others
                                        .filter((t) => t.teacherId !== slot.teacherId)
                                        .map((t) => (
                                            <option
                                                key={t.teacherId}
                                                value={t.teacherId}
                                            >
                                                {t.teacherName}
                                                {t.subjects?.length ? ` (${t.subjects.join(", ")})` : ""}
                                            </option>
                                        ))}
                                </optgroup>
                            )}
                        </select>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedTeacherId || submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Creating…" : "Create request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
