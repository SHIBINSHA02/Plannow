"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Edit2, Save, X, ExternalLink, Clock, FileText } from "lucide-react";
import { useTheme } from "@/app/theme-provider"; 
type OnboardingToken = {
    tokenId: string;
    organisationId: string;
    type: "TEACHER" | "CLASSROOM";
    instructions: string;
    expiresAt: string | Date;
    createdAt: string | Date;
};

export default function VerifySubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const organisationId = params.organisationId as string;
    const { theme } = useTheme(); // Extracted current theme

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [tokens, setTokens] = useState<OnboardingToken[]>([]);

    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Editing State
    const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
    const [editInstructions, setEditInstructions] = useState("");
    const [isSavingToken, setIsSavingToken] = useState(false);

    useEffect(() => {
        Promise.all([fetchSubmissions(), fetchTokens()]).finally(() => setLoading(false));
    }, [organisationId]);

    const fetchTokens = async () => {
        try {
            const res = await fetch(`/api/organisation/${organisationId}/onboarding-tokens`);
            if (res.ok) {
                const data = await res.json();
                setTokens(data.tokens || []);
            }
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`/api/organisation/${organisationId}/submissions`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateToken = async (tokenId: string) => {
        setIsSavingToken(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/onboarding-tokens/${tokenId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instructions: editInstructions }),
            });

            if (res.ok) {
                const data = await res.json();
                setTokens(prev => prev.map(t => t.tokenId === tokenId ? data.token : t));
                setEditingTokenId(null);
            } else {
                alert("Failed to update instructions");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating instructions");
        } finally {
            setIsSavingToken(false);
        }
    };

    const handleCopyLink = (tokenId: string) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/onboarding/${tokenId}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
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

    // Shared style definitions based on your Layout schema
    const isDark = theme === "dark";
    const cardBg = isDark ? "bg-[#0f172a]" : "bg-white";
    const subCardBg = isDark ? "bg-[#1e293b]" : "bg-gray-50";
    const borderColor = isDark ? "border-[#1e293b]" : "border-gray-200";
    const innerBorderColor = isDark ? "border-[#334155]" : "border-gray-100";
    const primaryTextColor = isDark ? "text-white" : "text-gray-900";
    const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";
    const mutedTextColor = isDark ? "text-gray-500" : "text-gray-400";

    if (loading) {
        return <div className={`p-8 animate-pulse text-lg font-medium text-center ${secondaryTextColor}`}>Loading pending submissions...</div>;
    }

    return (
        <div className="space-y-6 transition-colors duration-300">
            <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-4">
                <h1 className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>Management & Verification</h1>
                <button
                    onClick={() => router.push(`/dashboard/organisations/${organisationId}`)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-blue-600 shadow-sm hover:bg-blue-700 rounded-xl transition"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4">
                {submissions.length === 0 ? (
                    <div className="p-16 text-center bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-600 rounded-3xl shadow-sm relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 450 450' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                            }}
                        />
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 z-10 relative">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 z-10 relative">All Caught Up!</h3>
                        <p className="text-blue-100 z-10 relative">There are no pending submissions to review for this organisation.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map((sub: any) => (
                            <div key={sub._id} className={`${cardBg} ${borderColor} border flex flex-col justify-between p-6 rounded-3xl shadow-sm hover:shadow-lg transition duration-300`}>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full uppercase ${sub.type === "TEACHER" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                            {sub.type}
                                        </span>
                                        <span className={`text-xs font-medium ${mutedTextColor} ${subCardBg} px-2 py-1 rounded-lg`}>
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 text-sm">
                                        {Object.entries(sub.data).map(([key, value]: any) => (
                                            <div key={key}>
                                                <span className={`${secondaryTextColor} font-semibold block text-[10px] uppercase tracking-wider mb-1`}>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className={`${primaryTextColor} font-medium truncate block ${subCardBg} px-3 py-2 border ${innerBorderColor} rounded-lg`}>
                                                    {Array.isArray(value) ? value.join(", ") : value}
                                                </span>
                                            </div>
                                        ))}
                                        <div className={`mt-4 pt-4 border-t ${innerBorderColor}`}>
                                            <span className={`${secondaryTextColor} font-semibold block text-[10px] uppercase tracking-wider mb-1`}>Submitted By</span>
                                            <span className={`${isDark ? "text-gray-300" : "text-gray-600"} px-3 py-2 block truncate`}>{sub.submittedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 mt-auto pt-4 border-t ${innerBorderColor}`}>
                                    <button
                                        onClick={() => handleAction(sub._id, "REJECT")}
                                        disabled={processingId === sub._id}
                                        className={`flex-1 py-2.5 text-sm font-bold shadow-sm rounded-xl transition disabled:opacity-50
                                            ${isDark
                                                ? "text-red-400 bg-red-950/30 border border-red-900/50 hover:bg-red-900/40"
                                                : "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"}`}
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

            {/* ---------- Active Onboarding Links ---------- */}
            <div className={`max-w-6xl mx-auto w-full px-4 pt-8 border-t ${innerBorderColor}`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 ${isDark ? "bg-blue-950/50" : "bg-blue-50"} rounded-lg`}>
                        <ExternalLink className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>Active Onboarding Links</h2>
                </div>

                {tokens.length === 0 ? (
                    <div className={`p-10 text-center ${subCardBg} border border-dashed ${isDark ? "border-gray-800" : "border-gray-300"} rounded-3xl`}>
                        <p className={secondaryTextColor}>No active onboarding links found.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {tokens.map((token: OnboardingToken) => (
                            <div key={token.tokenId} className={`${cardBg} ${borderColor} border p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col gap-4 duration-300`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-xs font-semibold tracking-wide rounded-full uppercase ${token.type === "TEACHER" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                            {token.type} Link
                                        </span>
                                        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg ${isDark ? "text-blue-400 bg-blue-950/50" : "text-blue-600 bg-blue-50"}`}>
                                            <Clock className="w-3 h-3" />
                                            Expires {new Date(token.expiresAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopyLink(token.tokenId)}
                                        className={`p-2 rounded-xl transition ${isDark ? "text-gray-500 hover:text-blue-400 hover:bg-blue-950/50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                                        title="Copy Link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${secondaryTextColor}`}>
                                            <FileText className="w-3 h-3" />
                                            Instructions
                                        </div>
                                        {editingTokenId !== token.tokenId && (
                                            <button
                                                onClick={() => {
                                                    setEditingTokenId(token.tokenId);
                                                    setEditInstructions(token.instructions || "");
                                                }}
                                                className={`text-[10px] font-bold ${isDark ? "text-blue-400" : "text-blue-600"} hover:underline`}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {editingTokenId === token.tokenId ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editInstructions}
                                                onChange={(e) => setEditInstructions(e.target.value)}
                                                className={`w-full text-sm border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[80px] resize-none
                                                    ${isDark ? "bg-[#1e293b] border-blue-900 text-white" : "bg-white border-blue-200 text-gray-900"}`}
                                                placeholder="Enter instructions..."
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingTokenId(null)}
                                                    className={`p-1.5 rounded-lg transition ${isDark ? "text-gray-500 hover:text-red-400 hover:bg-red-950/30" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateToken(token.tokenId)}
                                                    disabled={isSavingToken}
                                                    className={`p-1.5 rounded-lg transition disabled:opacity-50 ${isDark ? "text-blue-400 hover:bg-blue-950/50" : "text-blue-600 hover:bg-blue-50"}`}
                                                >
                                                    {isSavingToken ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`text-sm px-4 py-3 border rounded-2xl min-h-[60px] italic ${subCardBg} ${innerBorderColor} ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                            {token.instructions || <span className={mutedTextColor}>No instructions provided.</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}