"use client";

import { Organisation } from "@/types/organisation";
import { useTheme } from "@/app/theme-provider";
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
    const { theme } = useTheme();

    // Theme-based style variables
    const bgColor = theme === "light" ? "bg-white" : "bg-[#0f172a]";
    const borderColor = theme === "light" ? "border-gray-200" : "border-slate-800";
    const titleColor = theme === "light" ? "text-gray-600" : "text-slate-400";

    const unselectedBtn = theme === "light"
        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700";

    return (
        <div className={`${bgColor} rounded-2xl border ${borderColor} p-5 shadow-sm`}>
            <h2 className={`text-sm font-medium ${titleColor} mb-4`}>
                Select organisation
            </h2>
            <div className="flex flex-wrap gap-3">
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
                            flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm
                            ${selectedOrgId === org.organisationId
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : unselectedBtn
                            }
                        `}
                    >
                        <Building2 size={16} />
                        {org.organisationName}
                    </button>
                ))}
            </div>
        </div>
    );
}