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
    status: "pending" | "approved" | "rejected";
    createdAt: string;
};

type Props = {
    organisationId: string;
    teachersMap: Record<string, string>;
};

export default function AdminSubstitutionOverview({ organisationId, teachersMap }: Props) {
    const [requests, setRequests] = useState<SubstitutionRequest[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse h-64"></div>;
    }

    const pendingRequests = requests.filter(r => r.status === "pending");
    const todayRequests = requests.filter(r => {
        const reqDate = new Date(r.createdAt);
        const today = new Date();
        return reqDate.toDateString() === today.toDateString();
    });

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
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {originalTeacher} <span className="text-gray-400 font-normal mx-1">→</span> {requestedTeacher}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Day {req.day}, P{req.period} • {req.subject}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-amber-100 text-amber-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                            </p>
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
        </div>
    );
}
