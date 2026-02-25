"use client";

import { useEffect, useState } from "react";
import { Organisation } from "@/types/organisation";
import OrganisationPicker from "./OrganisationPicker";
import SubstitutionWorkspace from "./SubstitutionWorkspace";

type TeacherOrg = { id: string; name: string };

type ClericalEntry = {
    teacherId: string;
    organisationId: string;
    organisationName: string;
};

/** Turn a list of {id, name} / {organisationId, organisationName} into Organisation[] */
function toOrgList(raw: { id?: string; name?: string; organisationId?: string; organisationName?: string }[]): Organisation[] {
    return raw.map((o) => ({
        _id: o.id ?? o.organisationId ?? "",
        organisationId: o.id ?? o.organisationId ?? "",
        organisationName: o.name ?? o.organisationName ?? "",
        adminName: "",
    }));
}

export default function SubstitutionClient() {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

    useEffect(() => {
        const mergeUnique = (a: Organisation[], b: Organisation[]) => {
            const seen = new Set(a.map((o) => o.organisationId));
            return [...a, ...b.filter((o) => !seen.has(o.organisationId))];
        };

        const fetchTeacher = fetch("/api/profile/teacher")
            .then((res) => {
                if (!res.ok) return [];
                return res
                    .json()
                    .then((data) =>
                        (data.teachers ?? []).flatMap(
                            (t: { organisations?: TeacherOrg[] }) =>
                                t.organisations ?? []
                        )
                    )
                    .then(toOrgList)
                    .catch(() => [] as Organisation[]);
            })
            .catch(() => [] as Organisation[]);

        const fetchClerical = fetch("/api/profile/clerical")
            .then((res) => {
                if (!res.ok) return [];
                return res
                    .json()
                    .then(
                        (data: {
                            clerical: { teacherIds: ClericalEntry[] } | null;
                        }) => {
                            if (!data.clerical) return [] as Organisation[];
                            return toOrgList(
                                data.clerical.teacherIds.map((t) => ({
                                    id: t.organisationId,
                                    name: t.organisationName,
                                }))
                            );
                        }
                    )
                    .catch(() => [] as Organisation[]);
            })
            .catch(() => [] as Organisation[]);

        Promise.all([fetchTeacher, fetchClerical])
            .then(([teacherOrgs, clericalOrgs]) => {
                const merged = mergeUnique(teacherOrgs, clericalOrgs);
                setOrganisations(merged);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <h1 className="text-2xl font-semibold text-gray-800 animate-pulse">
                    Substitution
                </h1>
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-100 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-red-500">{error}</p>
                <p className="text-sm text-gray-500 mt-2">
                    You need a teacher or clerical profile to use substitution.
                </p>
            </div>
        );
    }

    if (organisations.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Substitution
                </h1>
                <p className="text-gray-600">
                    You have no teacher or clerical profile in any organisation.
                    Add yourself as a teacher or a clerical to an organisation first.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">
                Substitution
            </h1>

            <OrganisationPicker
                organisations={organisations}
                selectedOrgId={selectedOrgId}
                onSelect={setSelectedOrgId}
            />

            {selectedOrgId && (
                <SubstitutionWorkspace organisationId={selectedOrgId} />
            )}
        </div>
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
