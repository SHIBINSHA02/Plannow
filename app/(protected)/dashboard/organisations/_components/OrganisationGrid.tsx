"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Organisation } from "@/types/organisation";
import { useTheme } from "@/app/theme-provider";
import { ShieldAlert, AlertCircle } from "lucide-react";

export default function OrganisationGrid() {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { theme } = useTheme();

    useEffect(() => {
        fetch("/api/organisation/my-organisations")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load organisations");
                return res.json();
            })
            .then(data => setOrganisations(data.organisations || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    /* ---------- Loading Skeleton ---------- */
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-6 w-48 rounded-md animate-pulse bg-slate-200 dark:bg-slate-800" />
                <div className="grid md:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-4 p-5 rounded-2xl border animate-pulse transition-colors duration-200
                                ${theme === "light"
                                    ? "bg-white border-slate-100"
                                    : "bg-[#0f172a] border-slate-800/80"}`}
                        >
                            <div className={`w-14 h-14 rounded-xl shrink-0 ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                            <div className="space-y-2 flex-1">
                                <div className={`h-4 w-1/2 rounded ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                                <div className={`h-3 w-1/3 rounded ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ---------- Error State ---------- */
    if (error) {
        return (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm transition-colors duration-200
                ${theme === "light"
                    ? "bg-red-50 border-red-100 text-red-600"
                    : "bg-red-950/20 border-red-900/30 text-red-400"}`}
            >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    /* ---------- Grid Workspace ---------- */
    return (
        <div
            className={`border rounded-3xl p-6 shadow-sm transition-all duration-200
                ${theme === "light"
                    ? "border-slate-100 bg-white shadow-blue-500/5"
                    : "border-slate-800 bg-[#0f172a] shadow-none"}`}
        >
            {/* Component Header Block */}
            <div className="mb-6 space-y-1">
                <h2 className={`text-lg font-medium tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                    Your Organisations
                </h2>
                <p className={`text-xs font-light flex items-center gap-1 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                    <ShieldAlert className="w-3.5 h-3.5 stroke-[2]" />
                    You hold administrative write-access permissions over these systems
                </p>
            </div>

            {/* Organizations Presentation Matrix */}
            {organisations.length === 0 ? (
                <div className={`text-center py-10 rounded-2xl border border-dashed text-sm font-light
                    ${theme === "light" ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-500"}`}
                >
                    No organisations connected to your administrative account profile.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-5">
                    {organisations.map(org => (
                        <div
                            key={org.organisationId}
                            onClick={() => router.push(`/dashboard/organisations/${org.organisationId}`)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer shadow-sm transition-all duration-200 active:scale-[0.99]
                                ${theme === "light"
                                    ? "bg-slate-50/50 border-slate-100 text-slate-800 hover:bg-white hover:border-slate-200 hover:shadow-blue-500/5"
                                    : "bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/90 hover:border-slate-700/80 hover:shadow-none"
                                }`}
                        >
                            {/* Profile Dynamic Avatar Container */}
                            <div
                                className={`w-14 h-14 rounded-xl overflow-hidden font-semibold text-lg shrink-0 flex items-center justify-center text-white select-none shadow-sm
                                    ${theme === "light" ? "bg-blue-600 shadow-blue-500/20" : "bg-blue-500 shadow-none"}`}
                            >
                                {org.profileImageUrl ? (
                                    <img
                                        src={org.profileImageUrl}
                                        alt={org.organisationName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    org.organisationName.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Descriptive Profile Text Metadata */}
                            <div className="space-y-1 overflow-hidden">
                                <h3 className={`font-medium text-sm tracking-tight truncate ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>
                                    {org.organisationName}
                                </h3>
                                <p className={`text-xs font-light truncate ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                    Admin: <span className="font-normal">{org.adminName}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}