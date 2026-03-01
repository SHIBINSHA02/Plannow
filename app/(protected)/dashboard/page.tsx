"use client";

import { useEffect, useState } from "react";
import AdminSubstitutionOverview from "./_components/AdminSubstitutionOverview";
import AdminMasterSchedule from "./_components/AdminMasterSchedule";
import AdminPersonalSchedule from "./_components/AdminPersonalSchedule";
import { Layers } from "lucide-react";

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

    // Initial load: Get user's profile and org details.
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch profiles to know what orgs the user admin belongs to
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

                    // Now fetch all teachers in this org for the teachersMap
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
            <main className="min-h-screen bg-[#FBFBFC] p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-3xl mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-200 rounded-xl lg:col-span-2"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </main>
        );
    }

    if (myOrganisations.length === 0) {
        return (
            <main className="min-h-screen bg-[#FBFBFC] p-6 flex items-center justify-center">
                <div className="text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">No Organisations Found</h2>
                    <p className="text-gray-500 mt-2">You are not linked to any active organisations.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FBFBFC] text-slate-800 antialiased overflow-y-scroll hide-scrollbar">
            {/* Header Section */}
            <header className="mx-auto px-6 pt-12 pb-8 border border-blue-300 rounded-3xl m-3 bg-white">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-light tracking-tight text-slate-900">
                            Organisation <span className="text-blue-600 font-normal">Overview</span>
                        </h1>
                        <p className="text-slate-500 leading-relaxed max-w-md font-light">
                            High-level view of your organisation's schedules, staff workloads, and substitutions.
                        </p>
                    </div>

                    {myOrganisations.length > 1 && (
                        <div className="mt-4 md:mt-0">
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                                Select Organisation
                            </label>
                            <select
                                value={selectedOrganisationId || ""}
                                onChange={(e) => setSelectedOrganisationId(e.target.value)}
                                className="border border-gray-200 rounded-lg px-4 py-2 w-full md:w-64 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                {myOrganisations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            {selectedOrganisationId && (
                <section className="mx-auto px-6 pb-20 mt-8 space-y-6">

                    {/* Top Row: Substitution metrics & Admin's own schedule */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 h-full">
                            <AdminSubstitutionOverview
                                organisationId={selectedOrganisationId}
                                teachersMap={teachersMap}
                            />
                        </div>
                        <div className="xl:col-span-1 h-full">
                            <AdminPersonalSchedule
                                organisationId={selectedOrganisationId}
                            />
                        </div>
                    </div>

                    {/* Master Schedule Bottom Row */}
                    <div className="w-full">
                        <AdminMasterSchedule
                            organisationId={selectedOrganisationId}
                            teachersMap={teachersMap}
                        />
                    </div>
                </section>
            )}
        </main>
    );
}
