"use client";

import React, { useEffect, useState } from "react";
import { Edit, Sparkles, Loader2 } from "lucide-react";
import { AlertConfig } from "@/types/alert";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LinkModel } from "./windows/LinkModel";
import { OrganisationEditWindow } from "./windows/organisationEdit";
import { useTheme } from "@/app/theme-provider";

type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

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
    const { theme } = useTheme();

    const [showLinkModal, setShowLinkModal] = useState<"TEACHER" | "CLASSROOM" | null>(null);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [profileUrl, setProfileUrl] = useState(organisation?.profileImageUrl ?? "");
    const [bgUrl, setBgUrl] = useState(organisation?.backgroundImageUrl ?? "");
    const [allowParallel, setAllowParallel] = useState(organisation?.allowParallelAssignments ?? false);

    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        if (organisation) {
            setProfileUrl(organisation.profileImageUrl ?? "");
            setBgUrl(organisation.backgroundImageUrl ?? "");
            setAllowParallel(organisation.allowParallelAssignments ?? false);
        }
    }, [organisation]);

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
        setAlertConfig((prev) => ({
            ...prev,
            isOpen: false,
        }));

        if (alertConfig.type === "confirm_auto_assign") {
            executeAutoAssign();
        }
    };

    return (
        <div className="space-y-8">
            <div
                className={`flex flex-col rounded-xl overflow-hidden border p-4 transition-all duration-200
                    ${theme === "light"
                        ? "border-blue-300 bg-white"
                        : "border-slate-800 bg-[#0f172a]"}`}
            >
                <div className="flex justify-between m-3 my-4">
                    <h2
                        className={`font-semibold mx-3 my-1 text-2xl tracking-tight
                            ${theme === "light" ? "text-blue-700" : "text-slate-100"}`}
                    >
                        Automate, Teachers and Classrooms
                    </h2>
                    <button
                        onClick={() => {
                            if (organisation) {
                                setProfileUrl(organisation.profileImageUrl ?? "");
                                setBgUrl(organisation.backgroundImageUrl ?? "");
                                setAllowParallel(organisation.allowParallelAssignments ?? false);
                            }
                            setShowEdit(true);
                        }}
                        className={`p-3 rounded-full transition-all active:scale-95 border
                            ${theme === "light"
                                ? "text-gray-400 bg-white border-gray-200 hover:bg-gray-100"
                                : "text-slate-400 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-slate-200"}`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAutoAssign}
                            disabled={isAutoAssigning || !canEdit}
                            title="Auto-assign schedules"
                            className="p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAutoAssigning ? (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            ) : (
                                <div
                                    className={`flex items-center gap-2 border transition-all px-3 py-1.5 rounded-xl w-full
                                        ${theme === "light"
                                            ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                            : "bg-blue-950/40 text-blue-400 border-blue-900/30 hover:bg-blue-950/70"}`}
                                >
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
                                    className={`px-3 py-3 rounded-full border transition-all duration-200 active:scale-95
                                        ${theme === "light"
                                            ? "bg-gray-50 text-blue-600 border-blue-600 hover:bg-blue-100 hover:invert"
                                            : "bg-slate-900 text-blue-400 border-slate-800 hover:bg-slate-800"}`}
                                >
                                    <Image
                                        src="/icons/teacher.png"
                                        alt="Teacher icon"
                                        width={30}
                                        height={25}
                                        className={`inline-block  ${theme === "dark" ? "brightness-110 invert" : ""}`}
                                    />
                                </button>

                                <button
                                    onClick={() => setShowLinkModal("CLASSROOM")}
                                    className={`px-3 py-3 rounded-full border transition-all duration-200 active:scale-95
                                        ${theme === "light"
                                            ? "bg-gray-50 text-blue-600 border-blue-600 hover:bg-blue-100 hover:invert"
                                            : "bg-slate-900 text-blue-400 border-slate-800 hover:bg-slate-800"}`}
                                >
                                    <Image
                                        src="/icons/classroom.png"
                                        alt="Classroom icon"
                                        width={30}
                                        height={25}
                                        className={`inline-block   cover ${theme === "dark" ? "brightness-110 invert" : ""}`}
                                    />
                                </button>

                                <button
                                    onClick={() => router.push(`/dashboard/organisations/${organisationId}/verify`)}
                                    className={`px-3 py-3 rounded-full border transition-all duration-200 active:scale-95
                                        ${theme === "light"
                                            ? "bg-gray-50 text-blue-600 border-blue-600 hover:bg-blue-100 hover:invert"
                                            : "bg-slate-900 text-blue-400 border-slate-800 hover:bg-slate-800"}`}
                                >
                                    <Image
                                        src="/icons/resume.png"
                                        alt="Resume verification icon"
                                        width={30}
                                        height={25}
                                        className={`inline-block  ${theme === "dark" ? "brightness-110 invert" : ""}`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {showLinkModal && canEdit && (
                        <LinkModel
                            organisationId={organisationId}
                            type={showLinkModal}
                            onClose={() => setShowLinkModal(null)}
                        />
                    )}

                    {showEdit && canEdit && (
                        <OrganisationEditWindow
                            organisationId={organisationId}
                            initialProfileUrl={organisation?.profileImageUrl}
                            initialBgUrl={organisation?.backgroundImageUrl}
                            initialAllowParallel={organisation?.allowParallelAssignments}
                            onClose={() => setShowEdit(false)}
                            onSuccess={(updatedOrg: Organisation) => setOrganisation(updatedOrg)}
                        />
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.type === "confirm_auto_assign" ? "Yes, Assign" : "OK"}
                cancelText={alertConfig.type === "confirm_auto_assign" ? "Cancel" : undefined}
                onConfirm={handleAlertConfirm}
                onClose={() =>
                    setAlertConfig((prev) => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
            />
        </div>
    );
};