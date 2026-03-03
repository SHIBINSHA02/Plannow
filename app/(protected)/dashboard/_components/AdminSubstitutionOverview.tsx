"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type SubstitutionRequest = {
    _id: string;
    organisationId: string;
    slotId: string;
    classroomId: string;
    day: number;
    period: number;
    subject: string;
    originalTeacherId: string;
    requestedTeacherId: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    createdAt: string;
};

type Props = {
    organisationId: string;
    teachersMap: Record<string, string>;
};

export default function AdminSubstitutionOverview({
    organisationId,
    teachersMap,
}: Props) {
    const [requests, setRequests] = useState<SubstitutionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [manageRequest, setManageRequest] =
        useState<SubstitutionRequest | null>(null);
    const [teacherOptions, setTeacherOptions] = useState<
        { teacherId: string; teacherName: string; subjects?: string[] }[]
    >([]);
    const [manageLoading, setManageLoading] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [savingManage, setSavingManage] = useState(false);
    const [manageError, setManageError] = useState<string | null>(null);

    useEffect(() => {
        if (!organisationId) return;

        const fetchRequests = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/substitution/all?organisationId=${organisationId}`
                );
                if (!res.ok) throw new Error("Failed to fetch requests");
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [organisationId]);

    const openReassign = async (req: SubstitutionRequest) => {
        setManageRequest(req);
        setSelectedTeacherId(req.requestedTeacherId);
        setManageError(null);
        setTeacherOptions([]);
        setManageLoading(true);

        try {
            const res = await fetch(
                `/api/substitution/teachers?organisationId=${organisationId}&classroomId=${req.classroomId}`
            );
            if (!res.ok) throw new Error("Failed to load teachers");
            const data = await res.json();
            const allTeachers = [
                ...(Array.isArray(data.inDepartment)
                    ? data.inDepartment
                    : []),
                ...(Array.isArray(data.others) ? data.others : []),
            ];
            setTeacherOptions(allTeachers);
        } catch (error: any) {
            setManageError(error.message || "Failed to load teachers");
        } finally {
            setManageLoading(false);
        }
    };

    const handleCancel = async (req: SubstitutionRequest) => {
        try {
            setSavingManage(true);
            const res = await fetch(`/api/substitution/${req._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel" }),
            });

            if (!res.ok) throw new Error("Failed to cancel");

            const updated = await res.json();
            setRequests((prev) =>
                prev.map((r) => (r._id === updated._id ? updated : r))
            );
        } catch (error: any) {
            setManageError(error.message);
        } finally {
            setSavingManage(false);
        }
    };

    const handleSaveReassign = async () => {
        if (!manageRequest || !selectedTeacherId) return;

        try {
            setSavingManage(true);
            setManageError(null);

            const res = await fetch(
                `/api/substitution/${manageRequest._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        requestedTeacherId: selectedTeacherId,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to update");

            const updated = await res.json();
            setRequests((prev) =>
                prev.map((r) => (r._id === updated._id ? updated : r))
            );

            setManageRequest(null);
        } catch (error: any) {
            setManageError(error.message);
        } finally {
            setSavingManage(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm animate-pulse h-64" />
        );
    }

    const pendingRequests = requests.filter(
        (r) => r.status === "pending"
    );

    const statusStyle = (status: SubstitutionRequest["status"]) => {
        if (status === "accepted")
            return "bg-blue-600 text-white";
        if (status === "rejected")
            return "border-red-600 bg-red-100 text-red-600";
        if (status === "cancelled")
            return "border-gray-400 bg-gray-100 text-gray-500";
        return "bg-blue-100 text-blue-700";
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-black">
                        Substitution Overview
                    </h3>
                    <p className="text-sm text-gray-600">
                        Organisation-wide summary
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-blue-600 text-white px-5 py-3 rounded-lg text-center">
                        <p className="text-2xl font-bold">
                            {requests.length}
                        </p>
                        <p className="text-xs font-medium tracking-wide">
                            TOTAL
                        </p>
                    </div>

                    <div className="bg-blue-100 text-blue-700 px-5 py-3 rounded-lg text-center">
                        <p className="text-2xl font-bold">
                            {pendingRequests.length}
                        </p>
                        <p className="text-xs font-medium tracking-wide">
                            PENDING
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {requests.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No substitution requests found.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {requests.slice(0, 10).map((req) => {
                            const originalTeacher =
                                teachersMap[
                                req.originalTeacherId
                                ] || "Unknown";
                            const requestedTeacher =
                                teachersMap[
                                req.requestedTeacherId
                                ] || "Unknown";

                            return (
                                <li
                                    key={req._id}
                                    className="p-4 border border-blue-100 rounded-lg hover:shadow-sm transition"
                                >
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-black text-sm">
                                                {originalTeacher} →{" "}
                                                {requestedTeacher}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Day {req.day}, P
                                                {req.period} •{" "}
                                                {req.subject}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded ${statusStyle(
                                                    req.status
                                                )}`}
                                            >
                                                {req.status.toUpperCase()}
                                            </span>

                                            <p className="text-[11px] text-gray-500">
                                                {format(
                                                    new Date(
                                                        req.createdAt
                                                    ),
                                                    "MMM d, h:mm a"
                                                )}
                                            </p>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        openReassign(
                                                            req
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                                                >
                                                    Reassign
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleCancel(
                                                            req
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1 border border-black text-black rounded hover:bg-black hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Modal */}
            {manageRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h4 className="font-bold text-black text-sm">
                            Reassign substitution
                        </h4>

                        {manageError && (
                            <p className="text-xs text-black">
                                {manageError}
                            </p>
                        )}

                        {manageLoading ? (
                            <div className="h-10 bg-blue-100 rounded animate-pulse" />
                        ) : (
                            <select
                                value={selectedTeacherId}
                                onChange={(e) =>
                                    setSelectedTeacherId(
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="">
                                    Select teacher
                                </option>
                                {teacherOptions.map((t) => (
                                    <option
                                        key={t.teacherId}
                                        value={t.teacherId}
                                    >
                                        {t.teacherName}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() =>
                                    setManageRequest(null)
                                }
                                className="px-4 py-1.5 text-xs border border-black text-black rounded hover:bg-black hover:text-white"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={
                                    !selectedTeacherId ||
                                    savingManage
                                }
                                onClick={handleSaveReassign}
                                className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingManage
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}