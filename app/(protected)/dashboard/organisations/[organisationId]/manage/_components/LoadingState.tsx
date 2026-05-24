// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/LoadingState.tsx
"use client";

import { Loader2 } from "lucide-react";

interface Props {
    loading: boolean;
    error: string | null;
    cardBase: string;
    subTextColor: string;
    theme: string;
}

export default function LoadingState({
    loading,
    error,
    cardBase,
    subTextColor,
    theme,
}: Props) {
    if (loading) {
        return (
            <div className={`${cardBase} flex items-center gap-3 ${subTextColor}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading organisation settings...
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={`${cardBase} text-sm ${
                    theme === "light"
                        ? "text-red-600"
                        : "text-red-400"
                }`}
            >
                {error}
            </div>
        );
    }

    return null;
}