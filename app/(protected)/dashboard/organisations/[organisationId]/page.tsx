"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function OrganisationPage() {
    const params = useParams();
    const organisationId = params.organisationId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [loading, setLoading] = useState(true);

    /* Edit state */
    const [showEdit, setShowEdit] = useState(false);
    const [profileUrl, setProfileUrl] = useState("");
    const [bgUrl, setBgUrl] = useState("");
    const [saving, setSaving] = useState(false);

    /* ---------- Fetch Organisation ---------- */
    useEffect(() => {
        if (!organisationId) return;

        fetch(`/api/organisation/${organisationId}`, { cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                setOrganisation(data);
                setProfileUrl(data.profileImageUrl ?? "");
                setBgUrl(data.backgroundImageUrl ?? "");
            })
            .finally(() => setLoading(false));
    }, [organisationId]);

    /* ---------- Save Images ---------- */
    const handleSaveImages = async () => {
        setSaving(true);

        const res = await fetch(`/api/organisation/${organisationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                profileImageUrl: profileUrl || null,
                backgroundImageUrl: bgUrl || null,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setOrganisation(data.organisation);
            setShowEdit(false);
        }

        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* ---------- Organisation Header ---------- */}
            <div className="flex flex-col rounded-4xl overflow-hidden border">
                {/* Background */}
                {organisation?.backgroundImageUrl ? (
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
                <div className="flex flex-col px-6 pb-6 -mt-12 flex items-start gap-4">
                    {/* Profile */}
                    {organisation?.profileImageUrl ? (
                        <img
                            src={organisation.profileImageUrl}
                            alt="Organisation Profile"
                            className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {organisation?.organisationName?.charAt(0)}
                        </div>
                    )}

                    {/* Text */}
                    <div>
                        {loading ? (
                            <p className="text-gray-400">
                                Loading organisation…
                            </p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between w-full">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-600">
                                    {organisation?.organisationName}
                                </h1>
                                <p className="text-sm text-gray-700">
                                    Organisation ID: {organisationId}
                                </p>
                                    </div>

                                <button
                                    onClick={() => setShowEdit(true)}
                                    className="mt-2 text-sm text-gray-400 p-2 rounded-xl"
                                >
                                    <Edit/>
                                </button>
                                    </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Edit Modal ---------- */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            Update Organisation Images
                        </h2>

                        <div>
                            <label className="text-sm font-medium">
                                Profile Image URL
                            </label>
                            <input
                                value={profileUrl}
                                onChange={e =>
                                    setProfileUrl(e.target.value)
                                }
                                className="mt-1 w-full border rounded px-3 py-2"
                                placeholder="https://example.com/profile.png"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Background Image URL
                            </label>
                            <input
                                value={bgUrl}
                                onChange={e => setBgUrl(e.target.value)}
                                className="mt-1 w-full border rounded px-3 py-2"
                                placeholder="https://example.com/background.jpg"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={handleSaveImages}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Other Sections ---------- */}
            <ClassroomSection />
            <TeachersSection />
        </div>
    );
}
