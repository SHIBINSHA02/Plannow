"use client";

import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "@/app/theme-provider";

type Request = {
    _id: string;
    classroomId: string;
    day: number;
    period: number;
    subject?: string;
    originalTeacherId?: string;
    requestedTeacherId: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    createdAt: string;
};

type Props = {
    requests: Request[];
    organisationId: string;
    onRefresh: () => void;
    teachersMap?: Record<string, string>;
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
};

export default function RequestList({
    requests,
    onRefresh,
    teachersMap = {},
}: Props) {
    const { theme } = useTheme();

    const handleUndo = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            const res = await fetch(`/api/substitution/${id}/undo`, {
                method: "POST",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to undo request");
            }
            onRefresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className={`rounded-2xl border p-5 shadow-sm sticky top-4 transition-colors duration-200 ${theme === "light" ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"
            }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold flex items-center gap-2 ${theme === "light" ? "text-slate-800" : "text-white"
                    }`}>
                    <ClipboardList size={18} />
                    Your requests
                </h3>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="text-xs text-blue-500 hover:underline"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {requests.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No substitution requests yet.
                    </p>
                ) : (
                    requests
                        .filter((req) => req.requestedTeacherId !== req.originalTeacherId)
                        .map((req) => {
                            const statusLabel = statusLabels[req.status] ?? req.status;
                            return (
                                <div
                                    key={req._id}
                                    className={`p-3 rounded-xl border transition-colors ${theme === "light"
                                            ? "border-slate-200 hover:border-slate-300"
                                            : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium truncate ${theme === "light" ? "text-slate-800" : "text-slate-200"
                                                    }`}>
                                                    {dayNames[req.day - 1] ?? `D${req.day}`} · P{req.period}
                                                    {req.subject && ` · ${req.subject}`}
                                                </p>
                                                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${theme === "light"
                                                        ? (statusColors[req.status] ?? "bg-gray-100 text-gray-600")
                                                        : "bg-slate-800 text-slate-400"
                                                    }`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Assign to: {teachersMap[req.requestedTeacherId] ?? req.requestedTeacherId}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                            </p>

                                            {req.status === "pending" && (
                                                <button
                                                    onClick={() => handleUndo(req._id)}
                                                    className={`mt-2 text-[11px] font-medium border rounded px-2 py-0.5 transition-colors ${theme === "light"
                                                            ? "text-red-600 border-red-100 hover:bg-red-50"
                                                            : "text-red-400 border-red-900/50 hover:bg-red-950/30"
                                                        }`}
                                                >
                                                    Undo Request
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}