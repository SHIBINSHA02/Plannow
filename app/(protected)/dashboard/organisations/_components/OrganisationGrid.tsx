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
            .then(res => {
                if (!res.ok) throw new Error("Failed to load organisations");
                return res.json();
            })
            .then(data => setOrganisations(data.organisations))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    /* ---------- Loading Skeleton ---------- */
    if (loading)
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-300 animate-pulse">
                    Your Organisations
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-5 bg-white rounded-xl
                                       shadow animate-pulse"
                        >
                            <div className="w-14 h-14 rounded-lg bg-gray-200" />

                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-200 rounded" />
                                <div className="h-3 w-28 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-4 bg-white border border-gray-300 rounded-3xl p-5">
            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-800">
                Your Organisations
                <span className="ml-2 text-sm text-gray-400">You have edit access</span>
            </h2>


            <div className="grid md:grid-cols-2 gap-5">
                {organisations.map(org => (
                    <div
                        key={org.organisationId}
                        onClick={() =>
                            router.push(
                                `/dashboard/organisations/${org.organisationId}`
                            )
                        }
                        className="flex items-center gap-4 p-5 bg-white rounded-xl shadow
                                   cursor-pointer hover:shadow-lg transition"
                    >
                        {/* Profile */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-blue-600
                                        flex items-center justify-center text-white
                                        font-semibold text-lg shrink-0">
                            {org.profileImageUrl ? (
                                <img
                                    src={org.profileImageUrl}
                                    alt={org.organisationName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                org.organisationName.charAt(0)
                            )}
                        </div>

                        {/* Text */}
                        <div>
                            <h3 className="font-semibold">
                                {org.organisationName}
                            </h3>
                            <p className="text-sm text-gray-400">
                                Admin: {org.adminName}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
