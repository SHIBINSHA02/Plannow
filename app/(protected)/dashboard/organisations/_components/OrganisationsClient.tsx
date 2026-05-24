// app/(protected)/dashboard/organisations/_components/OrganisationsClient.tsx
"use client";

import { useState } from "react";
import OrganisationGrid from "./OrganisationGrid";
import CreateOrganisationModal from "./CreateOrganisationModal";
import GetOrganisation from "./GetOrganisation";
import { Plus } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export default function OrganisationsClient() {
    const [open, setOpen] = useState(false);
    const { theme } = useTheme();

    return (
        <div className="w-full space-y-6">
            {/* Actions Header Toolbar */}
            <div className="flex items-center justify-end">
                <button
                    onClick={() => setOpen(true)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wide shadow-sm transition-all duration-200 active:scale-[0.98]
                        ${theme === "light"
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                            : "bg-blue-500 hover:bg-blue-600 text-white shadow-none"
                        }`}
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Create Organisation
                </button>
            </div>

            {/* Layout Workspace Grid */}
            <div className="flex flex-col gap-6">
                <OrganisationGrid />

                <GetOrganisation />
            </div>

            {/* Configuration Overlays & Modals */}
            <CreateOrganisationModal
                open={open}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}