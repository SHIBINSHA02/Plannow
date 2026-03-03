"use client";

import { ClipboardList } from "lucide-react";
import { format } from "date-fns";

type Request = {
    _id: string;
    classroomId: string;
    day: number;
    period: number;
    subject?: string;
    originalTeacherId?: string;
    requestedTeacherId: string;
    status: string;
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
};

const statusLabels: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Cancelled",
};

export default function RequestList({
    requests,
    onRefresh,
    teachersMap = {},
}: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList size={18} />
                    Your requests
                </h3>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="text-xs text-blue-600 hover:underline"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {requests.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">
                        No substitution requests yet. Click a slot in the
                        schedule to create one.
                    </p>
                ) : (
                    requests
                        .filter((req) => req.requestedTeacherId !== req.originalTeacherId)
                        .map((req) => {
                            const statusLabel =
                                statusLabels[req.status] ?? req.status;
                            return (
                                <div
                                    key={req._id}
                                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {dayNames[req.day - 1] ?? `D${req.day}`} · P
                                                {req.period}
                                                {req.subject && ` · ${req.subject}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Assign to:{" "}
                                                {teachersMap[req.requestedTeacherId] ??
                                                    req.requestedTeacherId}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                Last updated:{" "}
                                                {format(
                                                    new Date(req.createdAt),
                                                    "MMM d, h:mm a"
                                                )}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                                                statusColors[req.status] ??
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}
