"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

interface OrganisationEditWindowProps {
    organisationId: string;
    initialProfileUrl?: string | null;
    initialBgUrl?: string | null;
    initialAllowParallel?: boolean;
    onClose: () => void;
    onSuccess?: (updatedOrganisation: Organisation) => void;
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

    // Input settings states
    const [profileUrl, setProfileUrl] = useState(initialProfileUrl ?? "");
    const [bgUrl, setBgUrl] = useState(initialBgUrl ?? "");
    const [allowParallel, setAllowParallel] = useState(initialAllowParallel ?? false);

    // Status flag states
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Save Settings logic
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

            if (onSuccess) {
                onSuccess(data.organisation);
            }

            onClose();
        } catch (error) {
            console.error("Failed to save organization settings:", error);
        } finally {
            setSaving(false);
        }
    };

    // Self-contained Delete Logic
    const handleExecuteDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                router.replace("/unauthorized");
                return;
            }

            router.push("/dashboard/organisations");
            onClose();
        } catch (error) {
            console.error("Failed to delete organization:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl border border-gray-100">

                {/* CONDITIONAL INTERFACE: Double check confirm view state */}
                {isConfirmingDelete ? (
                    <div className="space-y-4 animation-fadeIn">
                        <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
                            <h3 className="font-bold text-base mb-1 text-red-600">Delete Organisation</h3>
                            Are you sure you want to delete this organisation? This will permanently erase all classrooms, teachers, and scheduled entries. This action cannot be undone.
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                disabled={deleting}
                                onClick={() => setIsConfirmingDelete(false)}
                                className="w-1/2 px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition native-btn"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={deleting}
                                onClick={handleExecuteDelete}
                                className="w-1/2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete"
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* REGULAR SETTINGS VIEW */
                    <>
                        <h2 className="text-xl font-semibold text-gray-900">Organisation Settings</h2>
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

                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 font-medium transition active:scale-[0.99]"
                        >
                            Delete Organisation
                        </button>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
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
                    </>
                )}
            </div>
        </div>
    );
};