"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerifySubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const organisationId = params.organisationId as string;

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [organisationId]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`/api/organisation/${organisationId}/submissions`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (submissionId: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(submissionId);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/submissions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId, action }),
            });

            if (res.ok) {
                // Remove from list
                setSubmissions(prev => prev.filter(s => s._id !== submissionId));
            } else {
                const data = await res.json();
                alert(data.message || `Failed to ${action.toLowerCase()}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action.toLowerCase()}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-gray-500 animate-pulse text-lg font-medium text-center">Loading pending submissions...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Review Pending Submissions</h1>
                <button
                    onClick={() => router.push(`/dashboard/organisations/${organisationId}`)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 rounded-xl transition"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4">
                {submissions.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-gray-200 rounded-3xl shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">There are no pending submissions to review for this organisation.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map((sub: any) => (
                            <div key={sub._id} className="bg-white border flex flex-col justify-between border-gray-200 p-6 rounded-3xl shadow-sm hover:shadow-lg transition">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full uppercase ${sub.type === "TEACHER" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                            {sub.type}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 text-sm">
                                        {Object.entries(sub.data).map(([key, value]: any) => (
                                            <div key={key}>
                                                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-gray-900 font-medium truncate block bg-gray-50 px-3 py-2 border border-gray-100 rounded-lg">
                                                    {Array.isArray(value) ? value.join(", ") : value}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider mb-1">Submitted By</span>
                                            <span className="text-gray-600 px-3 py-2 block truncate">{sub.submittedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleAction(sub._id, "REJECT")}
                                        disabled={processingId === sub._id}
                                        className="flex-1 py-2.5 text-sm font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 shadow-sm rounded-xl transition disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(sub._id, "APPROVE")}
                                        disabled={processingId === sub._id}
                                        className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 rounded-xl transition disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
