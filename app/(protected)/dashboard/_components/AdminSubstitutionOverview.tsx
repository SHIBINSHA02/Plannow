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
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
};

type Props = {
    organisationId: string;
    teachersMap: Record<string, string>;
};

export default function AdminSubstitutionOverview({ organisationId, teachersMap }: Props) {
    const [requests, setRequests] = useState<SubstitutionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [manageRequest, setManageRequest] = useState<SubstitutionRequest | null>(null);
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
                const res = await fetch(`/api/substitution/all?organisationId=${organisationId}`);
                if (!res.ok) throw new Error("Failed to fetch requests");
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error("Error fetching all substitutions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [organisationId]);

    const refreshRequests = async () => {
        try {
            const res = await fetch(`/api/substitution/all?organisationId=${organisationId}`);
            if (!res.ok) throw new Error("Failed to fetch requests");
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error("Error refreshing substitutions:", error);
        }
    };

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
                ...(Array.isArray(data.inDepartment) ? data.inDepartment : []),
                ...(Array.isArray(data.others) ? data.others : []),
            ];
            setTeacherOptions(allTeachers);
        } catch (error: any) {
            console.error("Failed to load teachers for reassign:", error);
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
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Failed to cancel");
            }
            const updated = await res.json();
            setRequests((prev) =>
                prev.map((r) => (r._id === updated._id ? updated : r))
            );
        } catch (error: any) {
            console.error("Failed to cancel substitution:", error);
            setManageError(error.message || "Failed to cancel substitution");
        } finally {
            setSavingManage(false);
        }
    };

    const handleSaveReassign = async () => {
        if (!manageRequest || !selectedTeacherId) return;
        try {
            setSavingManage(true);
            setManageError(null);
            const res = await fetch(`/api/substitution/${manageRequest._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestedTeacherId: selectedTeacherId }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Failed to update");
            }
            const updated = await res.json();
            setRequests((prev) =>
                prev.map((r) => (r._id === updated._id ? updated : r))
            );
            setManageRequest(null);
        } catch (error: any) {
            console.error("Failed to reassign substitution:", error);
            setManageError(error.message || "Failed to reassign");
        } finally {
            setSavingManage(false);
        }
    };

    if (loading) {
        return <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse h-64"></div>;
    }

    const pendingRequests = requests.filter(r => r.status === "pending");

    const prettyStatus = (status: SubstitutionRequest["status"]) => {
        if (status === "pending") return "Pending";
        if (status === "accepted") return "Accepted";
        if (status === "rejected") return "Cancelled";
        return status;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Substitution Overview</h3>
                    <p className="text-sm text-gray-500">Organisation-wide summary</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
                        <p className="text-xs text-blue-600 font-medium">Total</p>
                    </div>
                    <div className="bg-amber-50 px-4 py-2 rounded-lg text-center">
                        <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
                        <p className="text-xs text-amber-600 font-medium">Pending</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {requests.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No substitution requests found in this organisation.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {requests.slice(0, 10).map(req => {
                            const originalTeacher = teachersMap[req.originalTeacherId] || "Unknown";
                            const requestedTeacher = teachersMap[req.requestedTeacherId] || "Unknown";

                            return (
                                <li key={req._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900">
                                                {originalTeacher} <span className="text-gray-400 font-normal mx-1">→</span> {requestedTeacher}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Day {req.day}, P{req.period} • {req.subject}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                req.status === 'accepted'
                                                    ? 'bg-green-100 text-green-800'
                                                    : req.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {prettyStatus(req.status)}
                                            </span>
                                            <p className="text-[10px] text-gray-400">
                                                {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                            </p>
                                            <div className="flex gap-1 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openReassign(req)}
                                                    className="px-2 py-0.5 text-[11px] rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                                                >
                                                    Reassign
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(req)}
                                                    disabled={savingManage}
                                                    className="px-2 py-0.5 text-[11px] rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
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
            {requests.length > 10 && (
                <div className="text-center pt-2 border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View All {requests.length} Requests
                    </button>
                </div>
            )}

            {manageRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        className="absolute inset-0"
                        onClick={() => {
                            if (!savingManage) {
                                setManageRequest(null);
                                setManageError(null);
                            }
                        }}
                        aria-hidden
                    />
                    <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                    Reassign substitution
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Day {manageRequest.day}, P{manageRequest.period}
                                    {manageRequest.subject && ` • ${manageRequest.subject}`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!savingManage) {
                                        setManageRequest(null);
                                        setManageError(null);
                                    }
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                Close
                            </button>
                        </div>

                        {manageError && (
                            <p className="text-xs text-red-600">{manageError}</p>
                        )}

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">
                                Assign to teacher
                            </label>
                            {manageLoading ? (
                                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                            ) : (
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select teacher</option>
                                    {teacherOptions.map((t) => (
                                        <option key={t.teacherId} value={t.teacherId}>
                                            {t.teacherName}
                                            {t.subjects?.length
                                                ? ` (${t.subjects.join(", ")})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!savingManage) {
                                        setManageRequest(null);
                                        setManageError(null);
                                    }
                                }}
                                className="px-3 py-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!selectedTeacherId || savingManage || manageLoading}
                                onClick={handleSaveReassign}
                                className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingManage ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
