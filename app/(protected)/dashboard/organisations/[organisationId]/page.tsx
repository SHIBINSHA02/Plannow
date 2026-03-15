"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassroomSection from "./_components/ClassroomSection";
import TeachersSection from "./_components/Teachers/TeachersSection";

import { Edit } from "lucide-react";

/* ---------- Types ---------- */

type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
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
    const [saving, setSaving] = useState(false);

    /* Link Gen State */
    const [showLinkModal, setShowLinkModal] = useState<"TEACHER" | "CLASSROOM" | null>(null);
    const [linkTimer, setLinkTimer] = useState("24");
    const [linkInstructions, setLinkInstructions] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);

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

    /* ---------- Generate Onboarding Link ---------- */
    const handleGenerateLink = async () => {
        if (!showLinkModal) return;
        setGeneratingLink(true);
        setGeneratedLink("");

        try {
            const res = await fetch(`/api/organisation/${organisationId}/onboarding-tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: showLinkModal,
                    expiresInHours: Number(linkTimer),
                    instructions: linkInstructions
                })
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedLink(`${window.location.origin}/onboarding/${data.token.tokenId}`);
            } else {
                alert("Failed to generate link");
            }
        } catch (err) {
            console.error(err);
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

    /* ---------- FULL CONTENT ---------- */

    return (
        <div className="space-y-8">
            {/* ---------- Organisation Header ---------- */}
            <div className="flex flex-col rounded-4xl overflow-hidden border border-gray-300">
                {/* Background */}
                {organisation.backgroundImageUrl ? (
                    <div
                        className="h-48 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${organisation.backgroundImageUrl})`,
                        }}
                    />
                ) : (
                    <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-200" />
                )}

                {/* Content */}
                <div className="flex flex-col px-6 pb-6 -mt-12 items-start gap-4">
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
                    <div className="w-full flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600">
                                {organisation.organisationName}
                            </h1>
                            <p className="text-sm text-gray-700">
                                Organisation ID: {organisationId}
                            </p>
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
                                        onClick={() => setShowEdit(true)}
                                        className="text-gray-400 p-2 rounded-xl hover:bg-gray-100 transition bg-white border border-gray-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={handleDeleteOrganisation}
                                        disabled={deleting}
                                        className="
                                        px-3 py-2 rounded-xl text-sm font-medium
                                        bg-red-50 text-red-500 border border-red-500
                                        hover:bg-red-600 hover:text-white
                                        active:scale-95
                                        transition-all
                                        disabled:opacity-50
                                    "
                                    >
                                        {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Sections ---------- */}
            <ClassroomSection organisationId={organisationId} />
            <TeachersSection organisationId={organisationId} />

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
                            Update Organisation Images
                        </h2>

                        <input
                            value={profileUrl}
                            onChange={e => setProfileUrl(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Profile Image URL"
                        />

                        <input
                            value={bgUrl}
                            onChange={e => setBgUrl(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Background Image URL"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={handleSaveImages}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
