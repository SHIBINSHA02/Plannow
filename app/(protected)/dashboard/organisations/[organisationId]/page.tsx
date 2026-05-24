// app/(protected)/dashboard/organisations/[organisationId]/page.tsx
"use client";


import { useParams, usePathname, useRouter } from "next/navigation";
import ClassroomSection from "./_components/ClassroomSection";
import TeachersSection from "./_components/Teachers/TeachersSection";
import { Edit, Sparkles, Loader2, Delete, Trash2, FolderKanban } from "lucide-react";
import Image from "next/image";
import { Submissions } from "./_components/Submissions";
import { useTheme } from "@/app/theme-provider"; // Hook integrated safely
import { createToggleParallelAssignment} from "./_functions/tools";
import { useEffect, useState } from "react";
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
    const pathname = usePathname();
    
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



    

    const { theme } = useTheme();

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
                <div className={`h-48 rounded-xl ${theme === "light" ? "bg-gray-200" : "bg-slate-800"}`} />
                <div className={`h-8 w-64 rounded-lg ${theme === "light" ? "bg-gray-200" : "bg-slate-800"}`} />
                <div className={`h-4 w-40 rounded-md ${theme === "light" ? "bg-gray-200" : "bg-slate-800"}`} />
            </div>
        );
    }

    if (!organisation) {
        return null;
    }

    const handleToggleParallelAssignment = createToggleParallelAssignment({
        organisationId,
        organisation,
        setOrganisation,
        setLoading
    });

    const handleNavigate = () => {
       
        const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        router.push(`${cleanPath}/manage`);
    };
    /* ---------- FULL CONTENT ---------- */

    return (
        <div className="space-y-8">
            {/* ---------- Organisation Header ---------- */}
            <div
                className={`flex flex-col rounded-xl relative overflow-hidden border transition-all duration-200
                    ${theme === "light"
                        ? "border-gray-300"
                        : "border-slate-800"} 
                    ${organisation.allowParallelAssignments
                        ? (theme === "light" ? "shadow-md shadow-blue-400" : "shadow-md shadow-blue-950/50")
                        : (theme === "light" ? "shadow-md shadow-gray-300" : "shadow-none")}`}
            >
                {/* Background Banner */}
                {organisation.backgroundImageUrl ? (
                    <div
                        className="h-48 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${organisation.backgroundImageUrl})`,
                        }}
                    />
                ) : (
                    <div
                        className={`h-48 bg-gradient-to-br 
                            ${theme === "light"
                                ? "from-blue-300 via-blue-50 to-blue-300"
                                : "from-slate-900 via-blue-950/30 to-slate-900"}`}
                    />
                )}

                {/* Info Bar Panel Content */}
                <div
                    className={`flex flex-col px-6 pb-6 -mt-12 items-start gap-4 relative z-10
                        ${organisation.allowParallelAssignments
                            ? (theme === "light"
                                ? "bg-gradient-to-bl from-blue-600 via-blue-500 via-20% to-blue-600"
                                : "bg-gradient-to-bl from-blue-600 via-blue-500 via-20% to-blue-750")
                            : (theme === "light" ? "bg-white" : "bg-[#0f172a]")}`}
                >
                    {/* SVG Noise Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 450 450' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />

                    {/* Profile Avatar Shell */}
                    <div className="relative -top-10">
                        {organisation.profileImageUrl ? (
                            <img
                                src={organisation.profileImageUrl}
                                alt="Organisation Profile"
                                className={`w-24 h-24 rounded-full border-4 object-cover
                                    ${theme === "light" ? "border-white bg-white" : "border-slate-900 bg-slate-900"}`}
                            />
                        ) : (
                            <div
                                className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold
                                    ${theme === "light"
                                        ? "border-white bg-blue-600 text-white"
                                        : "border-slate-900 bg-blue-500 text-slate-900"}`}
                            >
                                {organisation.organisationName.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Meta Fields Block */}
                    <div className="w-full flex items-center justify-between relative z-10">
                        <div>
                            <h1
                                className={`text-3xl font-semibold 
                                    ${organisation.allowParallelAssignments
                                        ? "text-white"
                                        : (theme === "light" ? "text-blue-600" : "text-slate-100")}`}
                            >
                                {organisation.organisationName}
                            </h1>
                            <p
                                className={`text-sm my-3 
                                    ${organisation.allowParallelAssignments
                                        ? (theme === "light" ? "text-white/50" : "text-slate-400/60")
                                        : (theme === "light" ? "text-blue-600" : "text-blue-400")}`}
                            >
                                Organisation ID: {organisationId}
                            </p>

                            {/* Toggle Configuration Control */}
                            <div className="flex items-center gap-3">
                                <h1
                                    className={`text-base font-medium
                                        ${organisation.allowParallelAssignments
                                            ? "text-white"
                                            : (theme === "light" ? "text-blue-600" : "text-slate-300")}`}
                                >
                                    Enable Parallel Assignment
                                </h1>
                                <button
                                    onClick={handleToggleParallelAssignment}
                                    className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-200
                                        ${organisation.allowParallelAssignments
                                            ? (theme === "light" ? "bg-white shadow-blue-200 shadow-inner" : "bg-blue-500")
                                            : (theme === "light" ? "bg-white border border-gray-300 shadow-xl" : "bg-slate-800 border border-slate-700")
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
                                            ${organisation.allowParallelAssignments
                                                ? `translate-x-4 border shadow-inner ${theme === "light" ? "border-blue-500 bg-blue-600" : "border-slate-900 bg-slate-900"}`
                                                : `translate-x-0 border shadow-md ${theme === "light" ? "border-blue-600 bg-blue-600" : "border-slate-600 bg-slate-500"}`
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <button
                                onClick={handleNavigate}
                                disabled={!canEdit}
                                className={`ml-4 p-2 px-3 rounded-lg transition flex items-center gap-1 border ${
                                    canEdit
                                    ? organisation.allowParallelAssignments
                                        ? "bg-white text-gray-700 border-blue-600 hover:bg-blue-700" 
                                        : theme === "light"
                                        ? "text-gray-600 hover:bg-gray-100 border-slate-500"
                                        : "text-white hover:bg-gray-700 border-slate-500"
                                    : theme === "light"
                                        ? "text-gray-300 cursor-not-allowed border-gray-200"
                                        : "text-slate-700 cursor-not-allowed border-slate-800"
                                }`}
                                >
                                <FolderKanban size={18} />
                                Manage Organisation
                                </button>

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