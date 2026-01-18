"use client";

import { useEffect, useState } from "react";
import { Organisation } from "@/types/organisation";

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

    /* ---------------- Fetch Data ---------------- */

    const fetchData = async () => {
        setLoading(true);

        const [pinnedRes, allRes] = await Promise.all([
            fetch("/api/organisation/pin-organisation"),
            fetch("/api/organisation"),
        ]);

        const pinnedData = await pinnedRes.json();
        const allData = await allRes.json();

        setPinned(pinnedData.pinnedOrganisations || []);
        setAllOrganisations(allData.organisations || []);
        setLoading(false);
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
        pinned.map(p => p.organisationId._id)
    );

    const unpinnedFiltered = allOrganisations.filter(
        org =>
            !pinnedIds.has(org._id) &&
            org.organisationName
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    if (loading) {
        return <p className="text-gray-400">Loading organisations...</p>;
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="space-y-8">

            {/* ---------------- Pinned ---------------- */}
            <section>
                

                {pinned.length > 0 &&(
                    
                    
                    <div className="bg-white flex flex-col gap-5 p-5 rounded-3xl border border-blue-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Pinned Organisations
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                            
                        {pinned.map(pin => {
                            const org = pin.organisationId;
                            return (
                                <div
                                    key={org.organisationId}
                                    className="flex items-center justify-between
                                               p-4 bg-white border border-gray-300 rounded-xl shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-600
                                                        text-white flex items-center
                                                        justify-center font-semibold">
                                            {org.organisationName.charAt(0)}
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                {org.organisationName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Admin: {org.adminName}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            unpinOrganisation(
                                                org._id
                                            )
                                        }
                                        className="text-xs px-3 py-1 rounded-full
                                                   bg-red-50 text-red-600
                                                   hover:bg-red-100"
                                    >
                                        Unpin
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                        </div>
                )}
            </section>

            {/* ---------------- Search & Unpinned ---------------- */}
            <section className=" bg-white flex flex-col gap-5 p-5 rounded-3xl border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Available Organisations
                </h2>

                <input
                    type="text"
                    placeholder="Search organisations..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {unpinnedFiltered.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        No organisations found
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 bg-white  ">
                        {unpinnedFiltered.map(org => (
                            <div
                                key={org.organisationId}
                                className="flex items-center justify-between
                                           p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:border hover:border-blue-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200
                                                    flex items-center justify-center
                                                    font-semibold">
                                        {org.organisationName.charAt(0)}
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {org.organisationName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Admin: {org.adminName}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        pinOrganisation(org._id)
                                    }
                                    className="text-xs px-3 py-1 rounded-full
                                               bg-blue-50 text-blue-600
                                               hover:bg-blue-100"
                                >
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
