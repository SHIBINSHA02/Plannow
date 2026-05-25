// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/DangerZone.tsx
// app/(protected)/dashboard/organisations/[organisationId]/manage/components/DangerZone.tsx

"use client";

import {
    AlertTriangle,
    Loader2,
    Trash2,
} from "lucide-react";

interface Props {
    orgId: string;

    deleteConfirm: string;
    setDeleteConfirm: (value: string) => void;

    handleDeleteOrganisation: () => void;

    deleting: boolean;
    isAdmin: boolean;

    inputBase: string;
    theme: string;
}

export default function DangerZone({
    orgId,

    deleteConfirm,
    setDeleteConfirm,

    handleDeleteOrganisation,

    deleting,
    isAdmin,

    inputBase,
    theme,
}: Props) {
    return (
        <div
            className={`p-6 rounded-2xl border ${
                theme === "light"
                    ? "bg-red-50/50 border-red-200"
                    : "bg-red-950/10 border-red-900/50"
            }`}
        >
            <h3 className="flex items-center gap-2 text-red-600 font-bold mb-2">
                <AlertTriangle size={18} />
                Danger Zone
            </h3>

            <p
                className={`text-sm mb-4 ${
                    theme === "light"
                        ? "text-red-700"
                        : "text-red-400"
                }`}
            >
                Permanently delete this organisation and
                all its associated data. This action
                cannot be undone.
            </p>

            <div className="space-y-3 max-w-xl">
                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${
                            theme === "light"
                                ? "text-red-700"
                                : "text-red-400"
                        }`}
                    >
                        Type{" "}
                        <span className="font-bold">
                            {orgId}
                        </span>{" "}
                        to confirm
                    </label>

                    <input
                        type="text"
                        className={`${inputBase} ${
                            theme === "light"
                                ? "border-red-200 focus:border-red-400"
                                : "border-red-900/50 focus:border-red-500"
                        }`}
                        value={deleteConfirm}
                        onChange={(e) =>
                            setDeleteConfirm(
                                e.target.value
                            )
                        }
                    />
                </div>

                <button
                    onClick={handleDeleteOrganisation}
                    disabled={
                        !isAdmin ||
                        deleting ||
                        deleteConfirm !== orgId
                    }
                    className="flex items-center justify-center gap-2 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed
                    bg-red-600 hover:bg-red-700"
                >
                    {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 size={16} />
                    )}

                    {deleting
                        ? "Deleting..."
                        : "Delete Organisation"}
                </button>

                <p
                    className={`text-xs ${
                        theme === "light"
                            ? "text-red-700"
                            : "text-red-400"
                    }`}
                >
                    Admin-only. Editors can’t delete
                    organisations.
                </p>
            </div>
        </div>
    );
}