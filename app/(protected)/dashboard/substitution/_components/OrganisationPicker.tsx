"use client";

import { Organisation } from "@/types/organisation";
import { Building2 } from "lucide-react";

type Props = {
    organisations: Organisation[];
    selectedOrgId: string | null;
    onSelect: (id: string | null) => void;
};

export default function OrganisationPicker({
    organisations,
    selectedOrgId,
    onSelect,
}: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-600 mb-3">
                Select organisation
            </h2>
            <div className="flex flex-wrap gap-2">
                {organisations.map((org) => (
                    <button
                        key={org.organisationId}
                        onClick={() =>
                            onSelect(
                                selectedOrgId === org.organisationId
                                    ? null
                                    : org.organisationId
                            )
                        }
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg
                            transition-all
                            ${
                                selectedOrgId === org.organisationId
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }
                        `}
                    >
                        <Building2 size={18} />
                        {org.organisationName}
                    </button>
                ))}
            </div>
        </div>
    );
}
