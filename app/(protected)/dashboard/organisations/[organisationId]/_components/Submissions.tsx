"use client";

import React from 'react';
import { MouseEventHandler, useEffect, useState } from "react";
import { Edit, Sparkles, Loader2, Delete, Trash2 } from "lucide-react";
import { AlertConfig } from "@/types/alert";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

/* ---------- Types ---------- */
type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

// Define an interface for the component props
interface SubmissionsProps {
    canEdit: boolean;
    organisationId: string;
    organisation: Organisation | null;
    setOrganisation: React.Dispatch<React.SetStateAction<Organisation | null>>;
}

export const Submissions: React.FC<SubmissionsProps> = ({
    canEdit,
    organisationId,
    organisation,
    setOrganisation
}) => {
    const router = useRouter();

    const [showLinkModal, setShowLinkModal] = useState<"TEACHER" | "CLASSROOM" | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);
    const [loading, setLoading] = useState(true);

    /* Missing Link Gen states added back */
    const [linkTimer, setLinkTimer] = useState("24");
    const [linkInstructions, setLinkInstructions] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);

    /* Edit state */
    const [showEdit, setShowEdit] = useState(false);
    const [profileUrl, setProfileUrl] = useState(organisation?.profileImageUrl ?? "");
    const [bgUrl, setBgUrl] = useState(organisation?.backgroundImageUrl ?? "");
    const [allowParallel, setAllowParallel] = useState(organisation?.allowParallelAssignments ?? false);
    const [saving, setSaving] = useState(false);

    /* Alert Modal state */
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const closeAlert = () => setAlertConfig((prev) => ({ ...prev, isOpen: false }));

    /* Sync state when organization updates */
    useEffect(() => {
        if (organisation) {
            setProfileUrl(organisation.profileImageUrl ?? "");
            setBgUrl(organisation.backgroundImageUrl ?? "");
            setAllowParallel(organisation.allowParallelAssignments ?? false);
        }
    }, [organisation]);

    /* ---------- Save Images (Added back) ---------- */
    const handleSaveImages = async () => {
        if (!canEdit) return;
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
            setOrganisation(data.organisation);
            setShowEdit(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    /* ---------- Delete Organisation ---------- */
    const handleDeleteOrganisation = async () => {
        const confirmed = confirm(
            "Are you sure you want to delete this organisation?\nThis will delete all classrooms, teachers, and schedules."
        );

        if (!confirmed) return;

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
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    /* ---------- Link Generation ---------- */
    const handleGenerateLink = async () => {
        if (!showLinkModal) return;
        setGeneratingLink(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/onboarding-tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: showLinkModal,
                    expiresInHours: parseInt(linkTimer),
                    instructions: linkInstructions,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to generate link");

            const baseUrl = window.location.origin;
            const link = `${baseUrl}/onboarding/${data.token.tokenId}`;
            setGeneratedLink(link);
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setGeneratingLink(false);
        }
    };

    /* ---------- Auto Assign ---------- */
    const handleAutoAssign = () => {
        if (!canEdit) return;

        setAlertConfig({
            isOpen: true,
            title: "Confirm Auto-Assign",
            message: "Do you wish to auto-assign the schedule? This may overwrite existing un-locked entries.",
            type: "confirm_auto_assign",
        });
    };

    const executeAutoAssign = async () => {
        setIsAutoAssigning(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/auto-assign`, {
                method: "POST",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to auto-assign");

            setAlertConfig({
                isOpen: true,
                title: "Success",
                message: data.message || "Schedules auto-assigned successfully!",
                type: "info",
            });
        } catch (error: any) {
            console.error(error);
            setAlertConfig({
                isOpen: true,
                title: "Error",
                message: error.message || "An unexpected error occurred.",
                type: "error",
            });
        } finally {
            setIsAutoAssigning(false);
        }
    };

    const handleAlertConfirm = () => {
        const currentType = alertConfig.type;
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));

        if (currentType === "confirm_auto_assign") {
            executeAutoAssign();
        }
    };

    return (
        <div className='space-y-8'>
            <div className='flex  rounded-xl overflow-hidden border border-gray-300 p-4 bg-white'>
                <div className="flex items-center gap-2 w-full justify-end ">
                    <button
                        onClick={handleAutoAssign}
                        disabled={isAutoAssigning || !canEdit}
                        title="Auto-assign schedules"
                        className="text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAutoAssigning ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all px-3 py-1.5 rounded-xl w-full">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-sm font-medium">Auto Assign</span>
                            </div>
                        )}
                    </button>
                </div>
                {canEdit && (
                    <div className="flex gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowLinkModal("TEACHER")}
                                className="px-3 py-3 rounded-full text-sm font-medium hover:bg-white bg-gray-100 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                            >
                                <Image
                                    src="/icons/teacher.png"
                                    alt="Teacher icon"
                                    width={25}
                                    height={25}
                                    className="inline-block "
                                />
                            </button>

                            <button
                                onClick={() => setShowLinkModal("CLASSROOM")}
                                className="px-2 py-2 rounded-full text-sm font-medium hover:bg-white bg-gray-100 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                            >
                                <Image
                                    src="/icons/classroom.png"
                                    alt="Classroom icon"
                                    width={25}
                                    height={25}
                                    className="inline-block"
                                />
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/organisations/${organisationId}/verify`)}
                                className="px-2 py-2 rounded-full text-sm font-medium hover:bg-white bg-gray-100 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                            >
                                <Image
                                    src="/icons/resume.png"
                                    alt="Classroom icon"
                                    width={25}
                                    height={25}
                                    className="inline-block"
                                />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (organisation) {
                                        setProfileUrl(organisation.profileImageUrl ?? "");
                                        setBgUrl(organisation.backgroundImageUrl ?? "");
                                        setAllowParallel(organisation.allowParallelAssignments ?? false);
                                    }
                                    setShowEdit(true);
                                }}
                                className="text-gray-400 p-3 rounded-full hover:bg-gray-100 transition bg-white border border-gray-200"
                            >
                                <Edit className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleDeleteOrganisation}
                                disabled={deleting}
                                className="px-3 py-3 rounded-full text-sm font-medium bg-red-50 text-red-500 border border-red-500 hover:bg-red-600 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? "Deleting..." : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Modals Code remains structurally identical but states now work smoothly... */}
                {showLinkModal && canEdit && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                            <h2 className="text-xl font-semibold">
                                Generate {showLinkModal === "TEACHER" ? "Teacher" : "Classroom"} Link
                            </h2>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Valid for (in hours)</label>
                                <input
                                    type="number"
                                    value={linkTimer}
                                    onChange={e => setLinkTimer(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Custom Instructions</label>
                                <textarea
                                    value={linkInstructions}
                                    onChange={e => setLinkInstructions(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                />
                            </div>
                            {generatedLink && (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm break-all font-mono text-gray-800">
                                    {generatedLink}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => { setShowLinkModal(null); setGeneratedLink(""); setLinkInstructions(""); }}
                                    className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                {!generatedLink ? (
                                    <button
                                        disabled={generatingLink}
                                        onClick={handleGenerateLink}
                                        className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                                    >
                                        {generatingLink ? "Generating..." : "Generate"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedLink);
                                            alert("Link copied!");
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                                    >
                                        Copy Link
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showEdit && canEdit && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                            <h2 className="text-xl font-semibold">Organisation Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image URL</label>
                                    <input
                                        value={profileUrl}
                                        onChange={e => setProfileUrl(e.target.value)}
                                        className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Background Image URL</label>
                                    <input
                                        value={bgUrl}
                                        onChange={e => setBgUrl(e.target.value)}
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
                                <button onClick={() => setShowEdit(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button disabled={saving} onClick={handleSaveImages} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition">
                                    {saving ? "Saving..." : "Save Settings"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.type === "confirm_auto_assign" ? "Yes, Assign" : "OK"}
                cancelText={alertConfig.type === "confirm_auto_assign" ? "Cancel" : undefined}
                onConfirm={handleAlertConfirm}
                onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};