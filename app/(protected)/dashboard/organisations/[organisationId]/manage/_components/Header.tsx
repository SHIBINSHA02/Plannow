// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/Header.tsx
// components/Header.tsx

"use client";

import { ArrowLeft } from "lucide-react";

interface Props {
    orgId: string;
    textColor: string;
    theme: string;
    onBack: () => void;
}

export default function Header({
    orgId,
    textColor,
    theme,
    onBack,
}: Props) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <button
                onClick={onBack}
                className={`p-2 rounded-lg border transition ${
                    theme === "light"
                        ? "border-gray-200 hover:bg-gray-100"
                        : "border-slate-800 hover:bg-slate-800"
                }`}
            >
                <ArrowLeft size={20} className={textColor} />
            </button>

            <div>
                <h1 className={`text-2xl font-bold ${textColor}`}>
                    Manage Organisation
                </h1>

                <p
                    className={`text-sm ${
                        theme === "light"
                            ? "text-gray-500"
                            : "text-slate-400"
                    }`}
                >
                    ID: {orgId}
                </p>
            </div>
        </div>
    );
}