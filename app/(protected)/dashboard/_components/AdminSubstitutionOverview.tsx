"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTheme } from "@/app/theme-provider"; // Imported theme hook

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
    const [manageRequest, setManageRequest] = useState<SubstitutionRequest | null>(null);
    const [teacherOptions, setTeacherOptions] = useState<
        { teacherId: string; teacherName: string; subjects?: string[] }[]
    >([]);
    const [manageLoading, setManageLoading] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [savingManage, setSavingManage] = useState(false);
    const [manageError, setManageError] = useState<string | null>(null);
    const { theme } = useTheme(); // Subscribed to current theme

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
                ...(Array.isArray(data.inDepartment) ? data.inDepartment : []),
                ...(Array.isArray(data.others) ? data.others : []),
            ];
            setTeacherOptions(
                allTeachers.filter((t) => t.teacherId !== req.originalTeacherId)
            );
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
            <div
                className={`p-6 rounded-3xl animate-pulse h-64 border transition-colors duration-200
                    ${theme === "light" ? "bg-white border-slate-100" : "bg-[#0f172a] border-slate-800"}`}
            />
        );
    }

    const pendingRequests = requests.filter((r) => r.status === "pending");

    const statusStyle = (status: SubstitutionRequest["status"]) => {
        if (status === "accepted") {
            return theme === "light" ? "bg-blue-600 text-white" : "bg-blue-500 text-white";
        }
        if (status === "rejected") {
            return theme === "light"
                ? "border border-red-200 bg-red-50 text-red-600"
                : "border border-red-950 bg-red-950/30 text-red-400";
        }
        if (status === "cancelled") {
            return theme === "light"
                ? "border border-slate-200 bg-slate-50 text-slate-500"
                : "border border-slate-800 bg-slate-900/50 text-slate-400";
        }
        return theme === "light"
            ? "bg-blue-50 text-blue-600"
            : "bg-blue-950/30 text-blue-400";
    };

    return (
        <div
            className={`border p-6 rounded-3xl shadow-sm flex flex-col gap-6 transition-all duration-200
                ${theme === "light"
                    ? "bg-white border-slate-100 shadow-blue-500/5"
                    : "bg-[#0f172a] border-slate-800 shadow-none"}`}
        >
            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className={`text-lg font-medium tracking-tight transition-colors duration-200
                        ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        Substitution Overview
                    </h3>
                    <p className={`text-xs font-light transition-colors duration-200
                        ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        Organisation-wide summary
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className={`px-5 py-2.5 rounded-2xl text-center min-w-[76px] transition-colors duration-200
                        ${theme === "light" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`}>
                        <p className="text-xl font-semibold tracking-tight">{requests.length}</p>
                        <p className="text-[9px] font-medium tracking-wider opacity-80 uppercase mt-0.5">Total</p>
                    </div>

                    <div className={`px-5 py-2.5 rounded-2xl text-center min-w-[76px] transition-colors duration-200
                        ${theme === "light" ? "bg-blue-50 text-blue-600" : "bg-blue-950/40 text-blue-400"}`}>
                        <p className="text-xl font-semibold tracking-tight">{pendingRequests.length}</p>
                        <p className="text-[9px] font-medium tracking-wider uppercase mt-0.5">Pending</p>
                    </div>
                </div>
            </div>

            {/* Substitution Requests Pipeline */}
            <div className="flex-1 overflow-auto max-h-[500px] pr-1">
                {requests.length === 0 ? (
                    <div className={`text-center text-xs font-light py-12 transition-colors duration-200
                        ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        No substitution requests found.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {requests.slice(0, 10).map((req) => {
                            const originalTeacher = teachersMap[req.originalTeacherId] || "Unknown";
                            const requestedTeacher = teachersMap[req.requestedTeacherId] || "Unknown";

                            return (
                                <li
                                    key={req._id}
                                    className={`p-4 border rounded-2xl transition-all duration-200
                                        ${theme === "light"
                                            ? "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                                            : "border-slate-800/80 bg-[#0c1222] hover:border-slate-700/60"}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className={`font-medium text-sm tracking-tight transition-colors duration-200
                                                ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                                                {originalTeacher} <span className="text-blue-500 font-light mx-1">→</span> {requestedTeacher}
                                            </p>
                                            <p className={`text-xs font-light transition-colors duration-200
                                                ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                                Day {req.day}, Period {req.period} • <span className="font-normal">{req.subject}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                                            <span className={`px-2 py-0.5 text-[10px] font-medium tracking-wider rounded-md uppercase ${statusStyle(req.status)}`}>
                                                {req.status}
                                            </span>

                                            <p className={`text-[10px] font-light transition-colors duration-200
                                                ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                                {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                            </p>

                                            {req.status !== "rejected" && req.status !== "cancelled" && (
                                                <div className="flex gap-2 pt-0.5">
                                                    <button
                                                        onClick={() => openReassign(req)}
                                                        className={`text-[11px] font-medium px-3 py-1 border rounded-xl transition-all duration-150
                                                            ${theme === "light"
                                                                ? "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                                : "border-blue-900/60 text-blue-400 hover:bg-blue-950/30 hover:border-blue-800"
                                                            }`}
                                                    >
                                                        Reassign
                                                    </button>

                                                    <button
                                                        onClick={() => handleCancel(req)}
                                                        className={`text-[11px] font-medium px-3 py-1 border rounded-xl transition-all duration-150
                                                            ${theme === "light"
                                                                ? "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                                                : "border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-700"
                                                            }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Management Portal Modal Frame */}
            {manageRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className={`border rounded-3xl shadow-xl max-w-md w-full p-6 space-y-5 transition-all duration-200
                            ${theme === "light" ? "bg-white border-slate-100" : "bg-[#0f172a] border-slate-800"}`}
                    >
                        <div>
                            <h4 className={`text-base font-medium tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                Reassign Substitution
                            </h4>
                            <p className={`text-xs font-light mt-0.5 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                Update the resource node fallback route configuration safely.
                            </p>
                        </div>

                        {manageError && (
                            <div className={`p-3 rounded-xl text-xs font-light border
                                ${theme === "light"
                                    ? "bg-red-50 border-red-100 text-red-600"
                                    : "bg-red-950/20 border-red-900/50 text-red-400"}`}>
                                {manageError}
                            </div>
                        )}

                        {manageLoading ? (
                            <div className={`h-10 rounded-xl animate-pulse ${theme === "light" ? "bg-slate-100" : "bg-slate-900"}`} />
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:ring-4 outline-none transition-all appearance-none cursor-pointer
                                        ${theme === "light"
                                            ? "border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-blue-500/10 focus:border-blue-500"
                                            : "border-slate-700 bg-slate-900 text-slate-300 focus:bg-[#0f172a] focus:ring-blue-500/5 focus:border-blue-400"
                                        }`}
                                >
                                    <option value="">Select teacher</option>
                                    {teacherOptions.map((t) => (
                                        <option key={t.teacherId} value={t.teacherId}>
                                            {t.teacherName}
                                        </option>
                                    ))}
                                </select>
                                <div className={`absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setManageRequest(null)}
                                className={`px-4 py-2 text-xs font-medium border rounded-xl transition-all
                                    ${theme === "light"
                                        ? "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        : "border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                    }`}
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!selectedTeacherId || savingManage}
                                onClick={handleSaveReassign}
                                className={`px-4 py-2 text-xs font-medium rounded-xl text-white transition-all shadow-sm disabled:opacity-40
                                    ${theme === "light"
                                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10"
                                        : "bg-blue-500 hover:bg-blue-600 shadow-none"
                                    }`}
                            >
                                {savingManage ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}