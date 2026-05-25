// app/(protected)/dashboard/organisations/_components/GetOrganisation.tsx
"use client";

import { useEffect, useState } from "react";
import { Organisation } from "@/types/organisation";
import { useTheme } from "@/app/theme-provider";
import { Pin, PinOff, Search, Loader2 } from "lucide-react";

type PinnedOrganisation = {
    organisationId: Organisation;
    pinnedAt: string;
    order?: number;
};

export default function PinnedOrganisationManager() {
    const [pinned, setPinned] = useState<PinnedOrganisation[]>([]);
    const [allOrganisations, setAllOrganisations] = useState<Organisation[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    /* ---------------- Fetch Data ---------------- */

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pinnedRes, allRes] = await Promise.all([
                fetch("/api/organisation/pin-organisation"),
                fetch("/api/organisation"),
            ]);

            const pinnedData = await pinnedRes.json();
            const allData = await allRes.json();

            setPinned(pinnedData.pinnedOrganisations || []);
            setAllOrganisations(allData.organisations || []);
        } catch (err) {
            console.error("Failed to sync pinned organisations state:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ---------------- Actions ---------------- */

    const pinOrganisation = async (organisationId: string) => {
        await fetch("/api/organisation/pin-organisation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organisationId }),
        });
        fetchData();
    };

    const unpinOrganisation = async (organisationId: string) => {
        await fetch("/api/organisation/pin-organisation", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organisationId }),
        });
        fetchData();
    };

    /* ---------------- Derived Data ---------------- */

    const pinnedIds = new Set(
        pinned
            .filter(p => p.organisationId)
            .map(p => p.organisationId._id)
    );

    const unpinnedFiltered = allOrganisations.filter(
        org =>
            !pinnedIds.has(org._id) &&
            org.organisationName
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    /* ---------- Loading Skeleton State ---------- */
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className={`p-5 rounded-3xl border animate-pulse h-48 flex flex-col gap-4
                                ${theme === "light" ? "bg-white border-slate-100" : "bg-[#0f172a] border-slate-800"}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">

            {/* ---------------- Pinned Grid Section ---------------- */}
            {pinned.length > 0 && (
                <section
                    className={`p-6 border rounded-3xl shadow-sm transition-all duration-200
                        ${theme === "light"
                            ? "border-slate-100 bg-white shadow-blue-500/5"
                            : "border-slate-800 bg-[#0f172a] shadow-none"}`}
                >
                    <div className="mb-4 space-y-0.5">
                        <h2 className={`text-base font-medium tracking-tight flex items-center gap-2 ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                            <Pin className="w-4 h-4 text-blue-500 rotate-45 stroke-[2.5]" />
                            Pinned Workspace Shortcuts
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {pinned
                            .filter(pin => pin.organisationId)
                            .map(pin => {
                                const org = pin.organisationId;
                                return (
                                    <div
                                        key={org.organisationId}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200
                                            ${theme === "light"
                                                ? "bg-slate-50/50 border-slate-100 text-slate-800 hover:border-slate-200"
                                                : "bg-slate-900/40 border-slate-800/60 text-slate-300 hover:border-slate-700/60"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-10 h-10 rounded-xl font-semibold text-sm flex items-center justify-center shrink-0 text-white select-none shadow-sm
                                                ${theme === "light" ? "bg-blue-600 shadow-blue-500/10" : "bg-blue-500"}`}
                                            >
                                                {org.organisationName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="overflow-hidden space-y-0.5">
                                                <p className={`font-medium text-sm truncate ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>
                                                    {org.organisationName}
                                                </p>
                                                <p className={`text-xs font-light truncate ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                                    Admin: {org.adminName}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => unpinOrganisation(org._id)}
                                            className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 font-medium rounded-xl transition-all active:scale-[0.97] shrink-0
                                                ${theme === "light"
                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                    : "bg-red-950/20 text-red-400 hover:bg-red-950/50"
                                                }`}
                                        >
                                            <PinOff className="w-3.5 h-3.5" />
                                            Unpin
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </section>
            )}

            {/* ---------------- Available Index Workspace ---------------- */}
            <section
                className={`p-6 border rounded-3xl shadow-sm transition-all duration-200
                    ${theme === "light"
                        ? "border-slate-100 bg-white shadow-blue-500/5"
                        : "border-slate-800 bg-[#0f172a] shadow-none"}`}
            >
                <div className="mb-4 space-y-0.5">
                    <h2 className={`text-base font-medium tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        Available Institutions
                    </h2>
                </div>

                {/* Filter Controls Wrapper */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Filter systems index..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs font-light rounded-xl border outline-none focus:ring-4 transition-all
                            ${theme === "light"
                                ? "border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-blue-500/10 focus:border-blue-500"
                                : "border-slate-800 bg-slate-900 text-slate-200 focus:bg-[#0f172a] focus:ring-blue-500/5 focus:border-blue-400"
                            }`}
                    />
                    <Search className={`absolute left-3.5 top-3 w-4 h-4 stroke-[2] ${theme === "light" ? "text-slate-400" : "text-slate-500"}`} />
                </div>

                {unpinnedFiltered.length === 0 ? (
                    <div className={`text-center py-8 rounded-2xl border border-dashed text-xs font-light
                        ${theme === "light" ? "border-slate-200 text-slate-400" : "border-slate-800 text-slate-500"}`}
                    >
                        No directory entries match your query template.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {unpinnedFiltered.map(org => (
                            <div
                                key={org.organisationId}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200
                                    ${theme === "light"
                                        ? "bg-slate-50/50 border-slate-100 text-slate-800 hover:border-slate-200"
                                        : "bg-slate-900/40 border-slate-800/60 text-slate-300 hover:border-slate-700/60"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-xl font-medium text-sm flex items-center justify-center shrink-0
                                        ${theme === "light" ? "bg-slate-200 text-slate-600" : "bg-slate-800 text-slate-400"}`}
                                    >
                                        {org.organisationName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="overflow-hidden space-y-0.5">
                                        <p className={`font-medium text-sm truncate ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>
                                            {org.organisationName}
                                        </p>
                                        <p className={`text-xs font-light truncate ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                            Admin: {org.adminName}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => pinOrganisation(org._id)}
                                    className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 font-medium rounded-xl transition-all active:scale-[0.97] shrink-0
                                        ${theme === "light"
                                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                            : "bg-blue-950/30 text-blue-400 hover:bg-blue-950/60"
                                        }`}
                                >
                                    <Pin className="w-3.5 h-3.5 rotate-45" />
                                    Pin
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}