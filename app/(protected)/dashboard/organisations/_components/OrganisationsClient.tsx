"use client";

import { useState } from "react";
import OrganisationGrid from "./OrganisationGrid";
import CreateOrganisationModal from "./CreateOrganisationModal";
import GetOrganisation from "./GetOrganisation";

export default function OrganisationsClient() {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-end mb-6">
             

                <button
                    onClick={() => setOpen(true)}
                    className="px-5 py-2 text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
                >
                    + Create Organisation
                </button>
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-5">
            <OrganisationGrid />

            {/* Modal */}
            <CreateOrganisationModal
                open={open}
                onClose={() => setOpen(false)}
            />
            <GetOrganisation/>
            </div>
        </div>
    );
}
