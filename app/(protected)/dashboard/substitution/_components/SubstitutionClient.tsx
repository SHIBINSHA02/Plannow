"use client";

import { useEffect, useState } from "react";
import { Organisation } from "@/types/organisation";
import { useTheme } from "@/app/theme-provider";
import { Layers } from "lucide-react";
import OrganisationPicker from "./OrganisationPicker";
import SubstitutionWorkspace from "./SubstitutionWorkspace";

/* ---------- Types ---------- */

type TeacherOrg = { id: string; name: string };

type ClericalEntry = {
    teacherId: string;
    organisationId: string;
    organisationName: string;
};

/* ---------- Utility ---------- */

/** Turn a list of {id, name} / {organisationId, organisationName} into Organisation[] */
function toOrgList(raw: { id?: string; name?: string; organisationId?: string; organisationName?: string }[]): Organisation[] {
    return raw.map((o) => ({
        _id: o.id ?? o.organisationId ?? "",
        organisationId: o.id ?? o.organisationId ?? "",
        organisationName: o.name ?? o.organisationName ?? "",
        adminName: "",
    }));
}

/* ---------- Component ---------- */

export default function SubstitutionClient() {
    const { theme } = useTheme();
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Teacher Orgs
                const teacherRes = await fetch("/api/profile/teacher");
                const teacherData = teacherRes.ok ? await teacherRes.json() : { teachers: [] };
                const teacherOrgs = (teacherData.teachers ?? []).flatMap((t: { organisations?: TeacherOrg[] }) => t.organisations ?? []);

                // Fetch Clerical Orgs
                const clericalRes = await fetch("/api/profile/clerical");
                const clericalData = clericalRes.ok ? await clericalRes.json() : { clerical: null };
                const clericalOrgs = clericalData.clerical ? clericalData.clerical.teacherIds.map((t: ClericalEntry) => ({
                    id: t.organisationId,
                    name: t.organisationName,
                })) : [];

                const combined = [...toOrgList(teacherOrgs), ...toOrgList(clericalOrgs)];
                const unique = Array.from(new Map(combined.map((org) => [org.organisationId, org])).values());

                setOrganisations(unique);
                if (unique.length > 0) setSelectedOrgId(unique[0].organisationId);
            } catch (err: any) {
                setError(err.message || "Failed to load substitution data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <main className={`min-h-screen p-6 md:p-8 space-y-8 animate-pulse ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#090d16]"}`}>
                <div className={`h-12 w-64 rounded-xl ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-24 rounded-2xl ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
                    ))}
                </div>
            </main>
        );
    }

    if (error || organisations.length === 0) {
        return (
            <main className={`min-h-screen p-6 flex items-center justify-center ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#090d16]"}`}>
                <div className="text-center max-w-sm">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${theme === "light" ? "bg-blue-50" : "bg-blue-950/40"}`}>
                        <Layers className={`w-5 h-5 ${theme === "light" ? "text-blue-500" : "text-blue-400"}`} />
                    </div>
                    <h2 className={`text-lg font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        {error ? "Error Loading" : "No Organisations Found"}
                    </h2>
                    <p className={`text-sm mt-1.5 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        {error || "You are not linked to any active administrative systems."}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className={`min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-200 
            ${theme === "light" ? "bg-[#F8FAFC] text-slate-800" : "bg-[#090d16] text-slate-300"}`}>

            <header className={`px-8 py-8 border rounded-3xl ${theme === "light" ? "border-slate-100 bg-white" : "border-slate-800 bg-[#0f172a]"}`}>
                <h1 className={`text-2xl font-light tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                    Substitution <span className={`${theme === "light" ? "text-blue-600" : "text-blue-400"} font-normal`}>Management</span>
                </h1>
                <p className={`text-sm font-light mt-1.5 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                    Manage staff coverage and daily session adjustments.
                </p>
            </header>

            <div className="max-w-7xl mx-auto space-y-6">
                <OrganisationPicker
                    organisations={organisations}
                    selectedOrgId={selectedOrgId}
                    onSelect={setSelectedOrgId}
                />

                {selectedOrgId && (
                    <div className={`p-6 rounded-3xl border ${theme === "light" ? "bg-white border-slate-100" : "bg-[#0f172a] border-slate-800"}`}>
                        <SubstitutionWorkspace organisationId={selectedOrgId} />
                    </div>
                )}
            </div>
        </main>
    );
}

/**
 * SubstitutionClient Component
 * 
 * Main entry point for the substitution management dashboard.
 * 
 * 1. fetches user profile data from /api/profile/teacher and /api/profile/clerical.
 * 2. Merges organizations from both profiles to identify where the user has substitution-related roles.
 * 3. Provides an OrganisationPicker to select the active workspace.
 * 4. Renders the SubstitutionWorkspace for the selected organization to handle incoming/outgoing requests.
 */
