"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface OrganisationEditWindowProps {
    organisationId: string;
    // Pass initial values from parent to populate the form
    initialProfileUrl?: string | null;
    initialBgUrl?: string | null;
    initialAllowParallel?: boolean;
    // Function to let the parent close this window modal
    onClose: () => void;
    // Optional callback to inform parent that data refreshed successfully
    onSuccess?: (updatedOrganisation: any) => void;
}

export const OrganisationEditWindow: React.FC<OrganisationEditWindowProps> = ({
    organisationId,
    initialProfileUrl = "",
    initialBgUrl = "",
    initialAllowParallel = false,
    onClose,
    onSuccess,
}) => {
    const router = useRouter();

    // 1. Core States moved inside
    const [profileUrl, setProfileUrl] = useState(initialProfileUrl ?? "");
    const [bgUrl, setBgUrl] = useState(initialBgUrl ?? "");
    const [allowParallel, setAllowParallel] = useState(initialAllowParallel ?? false);
    const [saving, setSaving] = useState(false);

    // 2. The API request function moved inside
    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileImageUrl: profileUrl || null,
                    backgroundImageUrl: bgUrl || null,
                    allowParallelAssignments: allowParallel,
                }),
            });

            if (!res.ok) {
                router.replace("/unauthorized");
                return;
            }

            const data = await res.json();

            // If parent supplied a state update callback (like setOrganisation)
            if (onSuccess) {
                onSuccess(data.organisation);
            }

            // Close modal on success
            onClose();
        } catch (error) {
            console.error("Failed to save organization settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold">Organisation Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image URL</label>
                        <input
                            type="text"
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Background Image URL</label>
                        <input
                            type="text"
                            value={bgUrl}
                            onChange={(e) => setBgUrl(e.target.value)}
                            className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Allow Parallel Assignments</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={allowParallel}
                                onChange={(e) => setAllowParallel(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
};