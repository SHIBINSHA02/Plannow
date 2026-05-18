"use client";

import { MouseEventHandler, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassroomSection from "./_components/ClassroomSection";
import TeachersSection from "./_components/Teachers/TeachersSection";

import { Edit, Sparkles, Loader2, Delete, Trash2 } from "lucide-react";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import { AlertConfig } from "@/types/alert";
/* ---------- Types ---------- */

type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

type OrganisationResponse = {
    organisation: Organisation;
    canEdit: boolean;
};

export default function OrganisationPage() {
    const params = useParams();
    const router = useRouter();
    const organisationId = params.organisationId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);


    /* Edit state */
    const [showEdit, setShowEdit] = useState(false);
    const [profileUrl, setProfileUrl] = useState("");
    const [bgUrl, setBgUrl] = useState("");
    const [allowParallel, setAllowParallel] = useState(false);
    const [saving, setSaving] = useState(false);

    /* Link Gen state */
    const [showLinkModal, setShowLinkModal] = useState<"TEACHER" | "CLASSROOM" | null>(null);
    const [linkTimer, setLinkTimer] = useState("24");
    const [linkInstructions, setLinkInstructions] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);

    /* Auto Assign state */
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);
    /* Alert Modal state */
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const closeAlert = () => setAlertConfig((prev) => ({ ...prev, isOpen: false }));

    /* ---------- Fetch Organisation ---------- */
    useEffect(() => {
        if (!organisationId) return;

        const fetchOrganisation = async () => {
            try {
                const res = await fetch(
                    `/api/organisation/${organisationId}`,
                    { cache: "no-store" }
                );

                if (!res.ok) {
                    // layout already protects, this is fallback
                    router.replace("/unauthorized");
                    return;
                }

                const data: OrganisationResponse = await res.json();

                setOrganisation(data.organisation);
                setCanEdit(data.canEdit);
                setProfileUrl(data.organisation.profileImageUrl ?? "");
                setBgUrl(data.organisation.backgroundImageUrl ?? "");
                setAllowParallel(data.organisation.allowParallelAssignments ?? false);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganisation();
    }, [organisationId, router]);

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

            // redirect after delete
            router.push("/dashboard/organisations");
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };


    /* ---------- Save Images ---------- */
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

    /* ---------- Auto Assign ---------- */
    const handleAlertConfirm = () => {
        const currentType = alertConfig.type;

        // Close the modal first
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));

        // If it was a confirmation prompt, run the assignment
        if (currentType === "confirm_auto_assign") {
            executeAutoAssign();
        }
    };
    /* ---------- Step 1: Open the Confirmation Modal ---------- */
    const handleAutoAssign = () => {
        if (!canEdit) return;

        setAlertConfig({
            isOpen: true,
            title: "Confirm Auto-Assign",
            message: "Do you wish to auto-assign the schedule? This may overwrite existing un-locked entries.",
            type: "confirm_auto_assign",
        });
    };
   
    /* ---------- Step 2: Actually run the API call if they click Yes ---------- */
    const executeAutoAssign = async () => {
        setIsAutoAssigning(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/auto-assign`, {
                method: "POST",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to auto-assign");

            // Success Alert
            setAlertConfig({
                isOpen: true,
                title: "Success",
                message: data.message || "Schedules auto-assigned successfully!",
                type: "info",
            });

            // Optional: reload or refresh data here if needed
        } catch (error: any) {
            console.error(error);
            // Error Alert (Catches network issues and backend errors)
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

    /* ---------- GATED RENDERING ---------- */

    if (loading) {
        return (
            <div className="p-8 space-y-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl" />
                <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                <div className="h-4 w-40 bg-gray-200 rounded-md" />
            </div>
        );
    }

    if (!organisation) {
        return null;
    }

    const handleToggleParallelAssignment: MouseEventHandler<HTMLButtonElement> = async () => {
        try {
            setLoading(true);

            const updatedValue = !organisation.allowParallelAssignments;

            const res = await fetch(`/api/organisation/${organisationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    allowParallelAssignments: updatedValue,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update setting");
            }

            setOrganisation((prev) => {
                if (!prev) return null;

                return {
                    ...prev,
                    allowParallelAssignments: updatedValue,
                };
            });

            console.log(data.message);

        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* ---------- FULL CONTENT ---------- */

    return (
        <div className="space-y-8">
            {/* ---------- Organisation Header ---------- */}
            <div className={`flex flex-col rounded-xl overflow-hidden border border-gray-300 ${organisation.allowParallelAssignments ? "shadow-md shadow-blue-400" : "shadow-md shadow-gray-300"}`}>
                {/* Background */}
                {organisation.backgroundImageUrl ? (
                    <div
                        className="h-48 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${organisation.backgroundImageUrl})`,
                        }}
                    />
                ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-300 via-blue-50 to-blue-300" />
                )}

                {/* Content */}
                <div className={`flex flex-col px-6 pb-6 -mt-12 items-start gap-4   ${organisation.allowParallelAssignments ? "bg-gradient-to-bl from-blue-600 via-blue-500 via-20% to-blue-600 " : "bg-white"}`}
                    >
                    <div
                        className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 450 450' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />
                    {/* Profile */}
                    {organisation.profileImageUrl ? (
                        <img
                            src={organisation.profileImageUrl}
                            alt="Organisation Profile"
                            className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {organisation.organisationName.charAt(0)}
                        </div>
                    )}

                    {/* Text */}
                    <div className="w-full flex items-center justify-between ">
                        <div>
                            <h1 className={`text-3xl font-semibold  ${organisation.allowParallelAssignments ? "text-white " : "text-blue-600"}`}>
                                {organisation.organisationName}
                            </h1>
                            <p className={`text-sm text-gray-700 my-3 ${organisation.allowParallelAssignments ? "text-white/50":"text-blue-600"}`}>
                                Organisation ID: {organisationId}
                            </p>
                            <div className="flex items-center gap-3">
                                <h1 className={`text-gray-800 text-base " ${organisation.allowParallelAssignments ? "text-white" : "text-blue-600"}`}>Enable Parallel Assignment</h1>
                                <button
                                    onClick={handleToggleParallelAssignment}
                                    className={`w-10 h-5 flex items-center rounded-full p-1 transition ${organisation.allowParallelAssignments
                                            ? "bg-white  shadow-blue-200 shadow-inner"
                                            : "bg-white border border-gray-300  shadow-xl"
                                        }`}
                                >
                                    <div
                                        className={` w-4 h-4 rounded-full shadow-md transform transition ${organisation.allowParallelAssignments
                                                ? "translate-x-4 border border-blue-500 bg-blue-600 shadow-lg shadow-inner"
                                                : "translate-x-0 border border-blue-600 bg-blue-600 shadow-lg shadow-inner"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div>
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
                                        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all px-2 py-1 rounded-xl w-full">
                                            <Sparkles className="w-5 h-5" />
                                            
                                        </div>
                                    )}
                                </button>
                            </div>

                            {canEdit && (
                                <div className="flex flex-col gap-3 items-end">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowLinkModal("TEACHER")}
                                            className="px-3 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                                        >
                                            + Teacher Link
                                        </button>
                                        <button
                                            onClick={() => setShowLinkModal("CLASSROOM")}
                                            className="px-3 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                                        >
                                            + Classroom Link
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/organisations/${organisationId}/verify`)}
                                            className="px-3 py-2 rounded-xl text-sm font-medium bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 transition-all"
                                        >
                                            Review Submissions
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Edit */}
                                        <button
                                            onClick={() => {
                                                setProfileUrl(organisation.profileImageUrl ?? "");
                                                setBgUrl(organisation.backgroundImageUrl ?? "");
                                                setAllowParallel(organisation.allowParallelAssignments ?? false);
                                                setShowEdit(true);
                                            }}
                                            className="text-gray-400 p-3 rounded-full hover:bg-gray-100 transition bg-white border border-gray-200"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        {/* Delete */}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Sections ---------- */}
            
            <TeachersSection organisationId={organisationId} />
            <ClassroomSection organisationId={organisationId} />

            {/* ---------- Link Gen Modal ---------- */}
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
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Custom Instructions / Notes (Optional)
                            </label>
                            <textarea
                                value={linkInstructions}
                                onChange={e => setLinkInstructions(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder="E.g. Please use your official school email ID..."
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

            {/* ---------- Edit Modal ---------- */}
            {showEdit && canEdit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            Organisation Settings
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image URL</label>
                                <input
                                    value={profileUrl}
                                    onChange={e => setProfileUrl(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="https://example.com/profile.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Background Image URL</label>
                                <input
                                    value={bgUrl}
                                    onChange={e => setBgUrl(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="https://example.com/bg.jpg"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">Allow Parallel Assignments</p>
                                    <p className="text-[10px] text-blue-700">Enable if teachers can have overlapping slots across classrooms</p>
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
                                onClick={() => setShowEdit(false)}
                                className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={handleSaveImages}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                            >
                                {saving ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
}
