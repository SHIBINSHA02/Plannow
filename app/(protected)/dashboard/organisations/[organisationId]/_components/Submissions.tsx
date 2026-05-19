"use client";

import React from 'react';
import { MouseEventHandler, useEffect, useState } from "react";
import { Edit, Sparkles, Loader2, Delete, Trash2 } from "lucide-react";
import { AlertConfig } from "@/types/alert";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { OrganisationEditWindow } from './windows/organisationEdit';
import { LinkModel } from './windows/LinkModel';
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

    /* ---------- Delete Organisation ---------- */
    const handleDeleteOrganisation = () => {
        setAlertConfig({
            isOpen: true,
            title: "Delete Organisation",
            message:
                "Are you sure you want to delete this organisation? This will permanently delete all classrooms, teachers, and schedules.",
            type: "confirm_delete",
        });
    };

    const executeDeleteOrganisation = async () => {
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

        setAlertConfig((prev) => ({
            ...prev,
            isOpen: false,
        }));

        if (currentType === "confirm_auto_assign") {
            executeAutoAssign();
        }

        if (currentType === "confirm_delete") {
            executeDeleteOrganisation();
        }
    };

    return (
        <div className='space-y-8'>
            <div className='flex  flex-col rounded-xl overflow-hidden border border-gray-300 p-4 bg-white'>
                <h2 className='text-blue-700 font-semibold mx-3 my-5  '>Tools Section</h2>
                <div className='flex'>
                <div className="flex items-center gap-2 w-full justify- ">
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
                                    className="px-3 py-3 rounded-full text-sm font-medium hover:bg-white bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                            >
                                <Image
                                    src="/icons/teacher.png"
                                    alt="Teacher icon"
                                    width={40}
                                    height={25}
                                    className="inline-block "
                                />
                            </button>

                            <button
                                onClick={() => setShowLinkModal("CLASSROOM")}
                                    className="px-3 py-3 rounded-full text-sm font-medium hover:bg-white bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                            >
                                <Image
                                    src="/icons/classroom.png"
                                    alt="Classroom icon"
                                    width={40}
                                    height={25}
                                    
                                    className="inline-block cover"
                                />
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/organisations/${organisationId}/verify`)}
                                    className="px-3 py-3 rounded-full text-sm font-medium hover:bg-white bg-gray-50 text-blue-600 border border-blue-600 hover:bg-blue-100 transition-all hover:invert"
                            >
                                <Image
                                    src="/icons/resume.png"
                                    alt="Classroom icon"
                                    width={40}
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
                        <LinkModel
                            organisationId={organisationId}
                            type={showLinkModal} // Sends either "TEACHER" or "CLASSROOM"
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
                            onSuccess={(updatedOrg) => setOrganisation(updatedOrg)}
                        />
                    )}
                </div>
            </div>
            
            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={
                    alertConfig.type === "confirm_auto_assign"
                        ? "Yes, Assign"
                        : alertConfig.type === "confirm_delete"
                            ? "Delete"
                            : "OK"
                }
                cancelText={
                    alertConfig.type === "confirm_auto_assign" ||
                        alertConfig.type === "confirm_delete"
                        ? "Cancel"
                        : undefined
                }
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