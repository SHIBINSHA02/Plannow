"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Organisation } from "@/types/organisation";

export default function OrganisationGrid() {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetch("/api/organisation/my-organisations")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load organisations");
                return res.json();
            })
            .then((data) => setOrganisations(data.organisations))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading organisations…</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="grid md:grid-cols-2 gap-5">
            {organisations.map((org) => (
                <div
                    key={org.organisationId}
                    onClick={() =>
                        router.push(`/dashboard/organisations/${org.organisationId}`)

                    }
                    className="p-5 bg-white rounded-xl shadow cursor-pointer
                               hover:shadow-lg transition"
                >
                    <h3 className="font-semibold">
                        {org.organisationName}
                    </h3>

                    <p className="text-sm text-gray-400">
                        Admin: {org.adminName}
                    </p>
                </div>
            ))}
        </div>
    );
}
