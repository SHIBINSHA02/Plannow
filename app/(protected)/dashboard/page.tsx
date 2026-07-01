// app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import AdminSubstitutionOverview from "./_components/AdminSubstitutionOverview";
import AdminMasterSchedule from "./_components/AdminMasterSchedule";
import AdminPersonalSchedule from "./_components/AdminPersonalSchedule";
import { Layers } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

type Organisation = {
    id: string;
    name: string;
};

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    email: string;
    organisations: Organisation[];
};

export default function DashboardPage() {
    const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
    const [myOrganisations, setMyOrganisations] = useState<Organisation[]>([]);
    const [selectedOrganisationId, setSelectedOrganisationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Initial load: Get user's profile and org details.
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                const profileRes = await fetch("/api/profile/teacher", { cache: "no-store" });
                if (!profileRes.ok) throw new Error("Failed to fetch teacher profile");
                const profileData = await profileRes.json();

                const orgsMap = new Map<string, Organisation>();

                if (Array.isArray(profileData.teachers)) {
                    profileData.teachers.forEach((t: Teacher) => {
                        t.organisations.forEach(o => {
                            if (!orgsMap.has(o.id)) {
                                orgsMap.set(o.id, o);
                            }
                        });
                    });
                }

                const orgsList = Array.from(orgsMap.values());
                setMyOrganisations(orgsList);

                if (orgsList.length > 0) {
                    setSelectedOrganisationId(orgsList[0].id);

                    const teachersRes = await fetch(`/api/teachers?organisationId=${orgsList[0].id}`);
                    if (teachersRes.ok) {
                        const teachersList = await teachersRes.json();
                        const tMap: Record<string, string> = {};
                        teachersList.forEach((t: { teacherId: string; teacherName: string }) => {
                            tMap[t.teacherId] = t.teacherName;
                        });
                        setTeachersMap(tMap);
                    }
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // If org changes, refetch teachers map for that org
    useEffect(() => {
        if (!selectedOrganisationId || myOrganisations.length === 0) return;

        const fetchTeachers = async () => {
            const teachersRes = await fetch(`/api/teachers?organisationId=${selectedOrganisationId}`);
            if (teachersRes.ok) {
                const teachersList = await teachersRes.json();
                const tMap: Record<string, string> = {};
                teachersList.forEach((t: { teacherId: string; teacherName: string }) => {
                    tMap[t.teacherId] = t.teacherName;
                });
                setTeachersMap(tMap);
            }
        };
        fetchTeachers();
    }, [selectedOrganisationId, myOrganisations.length]);

    if (loading) {
        return (
            <main
                className={`min-h-screen p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse transition-colors duration-200
                    ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#090d16]"}`}
            >
                {/* Skeleton Header */}
                <div className={`h-40 rounded-3xl ${theme === "light" ? "bg-slate-200/60" : "bg-slate-800/50"}`} />
                {/* Skeleton Schedule */}
                <div className={`h-96 rounded-3xl ${theme === "light" ? "bg-slate-200/60" : "bg-slate-800/50"}`} />
                {/* Skeleton Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`h-80 rounded-3xl lg:col-span-2 ${theme === "light" ? "bg-slate-200/60" : "bg-slate-800/50"}`} />
                    <div className={`h-80 rounded-3xl ${theme === "light" ? "bg-slate-200/60" : "bg-slate-800/50"}`} />
                </div>
            </main>
        );
    }

    if (myOrganisations.length === 0) {
        return (
            <main
                className={`min-h-screen p-6 flex items-center justify-center antialiased transition-colors duration-200
                    ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#090d16]"}`}
            >
                <div className="text-center max-w-sm">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-200
                            ${theme === "light" ? "bg-blue-50" : "bg-blue-950/40"}`}
                    >
                        <Layers className={`w-5 h-5 ${theme === "light" ? "text-blue-500" : "text-blue-400"}`} />
                    </div>
                    <h2 className={`text-lg font-medium tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        No Organisations Found
                    </h2>
                    <p className={`text-sm mt-1.5 leading-relaxed ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        Your profile is not currently linked to any active administrative systems.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className={`min-h-screen antialiased max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 transition-colors duration-200
                ${theme === "light" ? "bg-[#F8FAFC] text-slate-800" : "bg-[#090d16] text-slate-300"}`}
        >
            {/* Header Section */}
            <header
                className={`px-8 py-10 border rounded-3xl shadow-sm transition-all duration-200
                    ${theme === "light"
                        ? "border-slate-100 bg-white shadow-blue-500/5"
                        : "border-slate-800 bg-[#0f172a] shadow-none"}`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h1 className={`text-2xl font-light tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                            Organisation <span className={`${theme === "light" ? "text-blue-600" : "text-blue-400"} font-normal`}>Overview</span>
                        </h1>
                        <p className={`text-sm font-light max-w-md leading-relaxed ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                            High-level view of system schedules, active staff workloads, and immediate resource substitutions.
                        </p>
                    </div>

                    {myOrganisations.length > 1 && (
                        <div className="shrink-0 w-full sm:w-auto">
                            <label className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                Select Organisation
                            </label>
                            <div className="relative w-full sm:w-60">
                                <select
                                    value={selectedOrganisationId || ""}
                                    onChange={(e) => setSelectedOrganisationId(e.target.value)}
                                    className={`border rounded-xl pl-3.5 pr-10 py-2.5 w-full text-xs font-medium focus:ring-4 outline-none transition-all cursor-pointer appearance-none
                                        ${theme === "light"
                                            ? "border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-blue-500/10 focus:border-blue-500"
                                            : "border-slate-700 bg-slate-900 text-slate-300 focus:bg-[#0f172a] focus:ring-blue-500/5 focus:border-blue-400"
                                        }`}
                                >
                                    {myOrganisations.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                                <div className={`absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            {selectedOrganisationId && (
                <section className="space-y-6 pb-12">
                    {/* Master Schedule Block */}
                    <AdminMasterSchedule
                        organisationId={selectedOrganisationId}
                        teachersMap={teachersMap}
                    />

                    {/* Split Layout Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                        {/* Substitution Columns */}
                        <div className="xl:col-span-2 w-full">
                            <AdminSubstitutionOverview
                                organisationId={selectedOrganisationId}
                                teachersMap={teachersMap}
                            />
                        </div>

                        {/* Personal Schedule Sidebar */}
                        <div className="xl:col-span-1 w-full">
                            <AdminPersonalSchedule
                                organisationId={selectedOrganisationId}
                            />
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}