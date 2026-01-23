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
                    className="px-5 py-2 text-white bg-blue-700 rounded-lg shadow hover:bg-blue-800"
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
