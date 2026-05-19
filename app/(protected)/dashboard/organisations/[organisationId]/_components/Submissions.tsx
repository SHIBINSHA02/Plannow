"use client";

import React, { useEffect, useState } from "react";
import { Edit, Sparkles, Loader2 } from "lucide-react";
import { AlertConfig } from "@/types/alert";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LinkModel } from "./windows/LinkModel";
import { OrganisationEditWindow } from "./windows/organisationEdit";

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
            <div className="flex flex-col rounded-xl overflow-hidden border border-blue-300 p-4 bg-white">
                <div className="flex justify-between m-3 my-4">
                    <h2 className="text-blue-700 font-semibold mx-3 my-1 text-2xl ">Automate, Teachers and Classrooms</h2>
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
                </div>

                <div className="flex">
                    <div className="flex items-center gap-2 w-full">
                        <button
                            onClick={handleAutoAssign}
                            disabled={isAutoAssigning || !canEdit}
                            title="Auto-assign schedules"
                            className="text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed "
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
                                    className="px-3 py-3 rounded-full text-sm font-medium bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                                >
                                    <Image
                                        src="/icons/teacher.png"
                                        alt="Teacher icon"
                                        width={30}
                                        height={25}
                                        className="inline-block "
                                    />
                                </button>

                                <button
                                    onClick={() => setShowLinkModal("CLASSROOM")}
                                    className="px-3 py-3 rounded-full text-sm font-medium bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                                >
                                    <Image
                                        src="/icons/classroom.png"
                                        alt="Classroom icon"
                                        width={30}
                                        height={25}
                                        className="inline-block cover"
                                    />
                                </button>

                                <button
                                    onClick={() => router.push(`/dashboard/organisations/${organisationId}/verify`)}
                                    className="px-3 py-3 rounded-full text-sm font-medium bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                                >
                                    <Image
                                        src="/icons/resume.png"
                                        alt="Classroom icon"
                                        width={30}
                                        height={25}
                                        className="inline-block"
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