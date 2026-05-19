"use client";

import { MouseEventHandler, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClassroomSection from "./_components/ClassroomSection";
import TeachersSection from "./_components/Teachers/TeachersSection";
import { Edit, Sparkles, Loader2, Delete, Trash2 } from "lucide-react";
import Image from "next/image";
import { Submissions } from "./_components/Submissions";
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
            <div className={`flex flex-col rounded-xl relative overflow-hidden border border-gray-300 ${organisation.allowParallelAssignments ? "shadow-md shadow-blue-400" : "shadow-md shadow-gray-300"}`}>
                {/* Background */}
                {organisation.backgroundImageUrl ? (
                    <div
                        className="h-48 bg-cover bg-center "
                        style={{
                            backgroundImage: `url(${organisation.backgroundImageUrl})`,
                        }}
                    />
                ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-300 via-blue-50 to-blue-300  " />
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
                    <div className="relative -top-10">
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
                    </div>

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

                    </div>
                </div>
            </div>

            {/* ---------- Sections ---------- */}
            <Submissions
                canEdit={canEdit}
                organisationId={organisationId}
                organisation={organisation}
                setOrganisation={setOrganisation}
            />
            <TeachersSection organisationId={organisationId} />
            <ClassroomSection organisationId={organisationId} /> 
        </div>
    );
}
