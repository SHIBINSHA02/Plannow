"use client";

import { useState } from "react";
import OrganisationGrid from "./OrganisationGrid";
import CreateOrganisationModal from "./CreateOrganisationModal";

export default function OrganisationsClient() {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-medium">Organisations</h1>

                <button
                    onClick={() => setOpen(true)}
                    className="px-5 py-2 text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
                >
                    + Create Organisation
                </button>
            </div>

            {/* Grid */}
            <OrganisationGrid />

            {/* Modal */}
            <CreateOrganisationModal
                open={open}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}
