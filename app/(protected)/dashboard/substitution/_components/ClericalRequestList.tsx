"use client";

import { useState } from "react";
import { Inbox, CheckCircle2, XCircle, RefreshCw, Clock } from "lucide-react";

type IncomingRequest = {
    _id: string;
    classroomId: string;
    day: number;
    period: number;
    subject?: string;
    originalTeacherId?: string;
    requestedTeacherId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
};

type Props = {
    requests: IncomingRequest[];
    onRefresh: () => void;
    teachersMap?: Record<string, string>;
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const statusConfig = {
    pending: {
        label: "Pending",
        icon: Clock,
        badge: "bg-amber-100 text-amber-700 border border-amber-200",
        card: "border-amber-100",
    },
    accepted: {
        label: "Accepted",
        icon: CheckCircle2,
        badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        card: "border-emerald-100",
    },
    rejected: {
        label: "Cancelled",
        icon: XCircle,
        badge: "bg-red-100 text-red-700 border border-red-200",
        card: "border-red-100",
    },
};

export default function ClericalRequestList({
    requests,
    onRefresh,
    teachersMap = {},
}: Props) {
    const [updating, setUpdating] = useState<string | null>(null);
    const [localRequests, setLocalRequests] = useState<IncomingRequest[]>(requests);

    // Keep local state in sync if parent refreshes
    if (localRequests !== requests && requests.length !== localRequests.length) {
        setLocalRequests(requests);
    }

    const handleStatus = async (id: string, status: "accepted" | "rejected") => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/substitution/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed");
            setLocalRequests((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status } : r))
            );
        } catch {
            // silently ignore; user can refresh
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-indigo-50/60">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2 text-sm">
                    <Inbox size={16} className="text-indigo-500" />
                    Incoming requests
                    {localRequests.filter((r) => r.status === "pending").length > 0 && (
                        <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {localRequests.filter((r) => r.status === "pending").length}
                        </span>
                    )}
                </h3>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="p-1 rounded hover:bg-indigo-100 text-indigo-500 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
                {localRequests.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8 px-4">
                        No incoming substitution requests.
                    </p>
                ) : (
                    localRequests.map((req) => {
                        const cfg = statusConfig[req.status] ?? statusConfig.pending;
                        const StatusIcon = cfg.icon;
                        const dayLabel = dayNames[req.day - 1] ?? `D${req.day}`;
                        const requestedBy =
                            teachersMap[req.originalTeacherId ?? ""] ??
                            req.originalTeacherId ??
                            "Unknown";

                        return (
                            <div
                                key={req._id}
                                className={`px-4 py-3 hover:bg-gray-50/80 transition-colors border-l-4 ${cfg.card}`}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {dayLabel} · P{req.period}
                                            {req.subject && (
                                                <span className="text-gray-500"> · {req.subject}</span>
                                            )}
                                        </p>
                                        {req.originalTeacherId && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                From:{" "}
                                                <span className="font-medium text-gray-700">
                                                    {requestedBy}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
                                    >
                                        <StatusIcon size={11} />
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Action buttons – only when pending */}
                                {req.status === "pending" && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            disabled={updating === req._id}
                                            onClick={() => handleStatus(req._id, "accepted")}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={13} />
                                            Accept
                                        </button>
                                        <button
                                            type="button"
                                            disabled={updating === req._id}
                                            onClick={() => handleStatus(req._id, "rejected")}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <XCircle size={13} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
