"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClassroomSection from "./_components/ClassroomSection";
import TeachersSection from "./_components/Teachers/TeachersSection";

type Organisation = {
    organisationId: string;
    organisationName: string; // ✅ correct field
    adminName: string;
};

export default function OrganisationPage() {
    const params = useParams();
    const organisationId = params.organisationId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organisationId) return;

        fetch(`/api/organisation/${organisationId}`, {
            cache: "no-store",
        })
            .then(res => res.json())
            .then(data => setOrganisation(data))
            .finally(() => setLoading(false));
    }, [organisationId]);

    return (
        <div className="space-y-8">
            {/* Organisation Header */}
            <div className="border-b pb-4">
                {loading ? (
                    <p className="text-gray-400">Loading organisation…</p>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-blue-700">
                            {organisation?.organisationName}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Organisation ID: {organisationId}
                        </p>
                    </>
                )}
            </div>

            <ClassroomSection />
            <TeachersSection />
        </div>
    );
}
