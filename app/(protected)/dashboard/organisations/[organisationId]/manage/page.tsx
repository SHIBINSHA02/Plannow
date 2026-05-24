// app/(protected)/dashboard/organisations/[organisationId]/manage/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useTheme } from "@/app/theme-provider";

import useOrganisationForm from "./useOrganisationForm";

import Header from "./_components/Header";
import LoadingState from "./_components/LoadingState";
import GeneralSettingsCard from "./_components/GeneralSettingsCard";
import EditorsCard from "./_components/EditorsCard";
import DangerZone from "./_components/DangerZone";
import QuickLinks from "./_components/QuickLinks";

import {
    Organisation,
    OrganisationResponse,
} from "./types";

import { getThemeClasses } from "./_components/theme";

export default function ManageOrganisationPage() {
    const { theme } = useTheme();

    const router = useRouter();

    const params = useParams<{
        organisationId: string;
    }>();

    const orgId = params.organisationId;

    const themeClasses = getThemeClasses(theme);

    const [organisation, setOrganisation] =
        useState<Organisation | null>(null);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [saving, setSaving] =
        useState<boolean>(false);

    const [deleting, setDeleting] =
        useState<boolean>(false);

    const [error, setError] = useState<
        string | null
    >(null);

    const [canEdit, setCanEdit] =
        useState<boolean>(false);

    const [isAdmin, setIsAdmin] =
        useState<boolean>(false);

    const [newEditorEmail, setNewEditorEmail] =
        useState<string>("");

    const [deleteConfirm, setDeleteConfirm] =
        useState<string>("");

    const {
        organisationName,
        setOrganisationName,

        workingDays,
        setWorkingDays,

        periodsPerDay,
        setPeriodsPerDay,

        allowParallel,
        setAllowParallel,

        profileUrl,
        setProfileUrl,

        bgUrl,
        setBgUrl,

        editors,
        setEditors,

        isDirty,
    } = useOrganisationForm(organisation);

    useEffect(() => {
        if (!orgId) return;

        const fetchOrganisation = async () => {
            try {
                setLoading(true);

                setError(null);

                const res = await fetch(
                    `/api/organisation/${orgId}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!res.ok) {
                    router.replace(
                        "/unauthorized"
                    );

                    return;
                }

                const data: OrganisationResponse =
                    await res.json();

                setOrganisation(
                    data.organisation
                );

                setCanEdit(data.canEdit);

                setIsAdmin(
                    Boolean(data.isAdmin)
                );

                setOrganisationName(
                    data.organisation
                        .organisationName ?? ""
                );

                setWorkingDays(
                    data.organisation
                        .workingDays ?? 5
                );

                setPeriodsPerDay(
                    data.organisation
                        .periodsPerDay ?? 6
                );

                setAllowParallel(
                    Boolean(
                        data.organisation
                            .allowParallelAssignments
                    )
                );

                setProfileUrl(
                    data.organisation
                        .profileImageUrl ?? ""
                );

                setBgUrl(
                    data.organisation
                        .backgroundImageUrl ?? ""
                );

                setEditors(
                    Array.isArray(
                        data.organisation
                            .editors
                    )
                        ? data.organisation
                              .editors
                        : []
                );
            } catch (err: any) {
                setError(
                    err?.message ||
                        "Failed to load organisation"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrganisation();
    }, [
        orgId,
        router,
        setOrganisationName,
        setWorkingDays,
        setPeriodsPerDay,
        setAllowParallel,
        setProfileUrl,
        setBgUrl,
        setEditors,
    ]);

    const handleSave = async () => {
        if (!canEdit || !orgId) return;

        try {
            setSaving(true);

            setError(null);

            const res = await fetch(
                `/api/organisation/${orgId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        organisationName:
                            organisationName.trim(),

                        workingDays,

                        periodsPerDay,

                        allowParallelAssignments:
                            allowParallel,

                        profileImageUrl:
                            profileUrl.trim() ||
                            null,

                        backgroundImageUrl:
                            bgUrl.trim() || null,

                        ...(isAdmin
                            ? { editors }
                            : {}),
                    }),
                }
            );

            if (!res.ok) {
                const data = await res
                    .json()
                    .catch(() => null);

                alert(
                    data?.message ||
                        "Failed to save changes"
                );

                return;
            }

            const data: OrganisationResponse =
                await res.json();

            setOrganisation(
                data.organisation
            );

            setCanEdit(data.canEdit);

            setIsAdmin(
                Boolean(data.isAdmin)
            );
        } catch (err: any) {
            setError(
                err?.message ||
                    "Failed to save changes"
            );
        } finally {
            setSaving(false);
        }
    };

    const normalizeEmail = (
        email: string
    ): string =>
        email.trim().toLowerCase();

    const handleAddEditor = () => {
        if (!isAdmin) return;

        const email =
            normalizeEmail(
                newEditorEmail
            );

        if (!email) return;

        if (
            organisation?.adminName &&
            normalizeEmail(
                organisation.adminName
            ) === email
        ) {
            setNewEditorEmail("");

            return;
        }

        if (
            editors
                .map(normalizeEmail)
                .includes(email)
        ) {
            setNewEditorEmail("");

            return;
        }

        setEditors((prev: string[]) => [
            ...prev,
            email,
        ]);

        setNewEditorEmail("");
    };

    const handleRemoveEditor = (
        email: string
    ) => {
        if (!isAdmin) return;

        const target =
            normalizeEmail(email);

        setEditors((prev: string[]) =>
            prev.filter(
                (e: string) =>
                    normalizeEmail(e) !==
                    target
            )
        );
    };

    const handleDeleteOrganisation =
        async () => {
            if (!isAdmin) {
                alert(
                    "Only admin can delete organisation."
                );

                return;
            }

            if (
                deleteConfirm !== orgId
            ) {
                alert(
                    "Type organisation ID correctly."
                );

                return;
            }

            const ok = confirm(
                "Delete organisation permanently?"
            );

            if (!ok) return;

            try {
                setDeleting(true);

                const res = await fetch(
                    `/api/organisation/${orgId}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!res.ok) {
                    const data =
                        await res
                            .json()
                            .catch(
                                () => null
                            );

                    alert(
                        data?.message ||
                            "Failed to delete organisation"
                    );

                    return;
                }

                router.replace(
                    "/dashboard/organisations"
                );
            } catch (err: any) {
                setError(
                    err?.message ||
                        "Failed to delete organisation"
                );
            } finally {
                setDeleting(false);
            }
        };

    return (
        <div className="space-y-6 max-w-5xl lg:mx-auto lg:p-6">
            <Header
                orgId={orgId}
                textColor={
                    themeClasses.textColor
                }
                theme={theme}
                onBack={() =>
                    router.back()
                }
            />

            <LoadingState
                loading={loading}
                error={error}
                cardBase={
                    themeClasses.cardBase
                }
                subTextColor={
                    themeClasses.subTextColor
                }
                theme={theme}
            />

            {!loading && !error && (
                <>
                    <QuickLinks
                        orgId={orgId}
                        router={router}
                        cardBase={
                            themeClasses.cardBase
                        }
                        textColor={
                            themeClasses.textColor
                        }
                        subTextColor={
                            themeClasses.subTextColor
                        }
                    />

                    <GeneralSettingsCard
                        organisationName={
                            organisationName
                        }
                        setOrganisationName={
                            setOrganisationName
                        }
                        workingDays={
                            workingDays
                        }
                        setWorkingDays={
                            setWorkingDays
                        }
                        periodsPerDay={
                            periodsPerDay
                        }
                        setPeriodsPerDay={
                            setPeriodsPerDay
                        }
                        allowParallel={
                            allowParallel
                        }
                        setAllowParallel={
                            setAllowParallel
                        }
                        profileUrl={
                            profileUrl
                        }
                        setProfileUrl={
                            setProfileUrl
                        }
                        bgUrl={bgUrl}
                        setBgUrl={setBgUrl}
                        handleSave={
                            handleSave
                        }
                        saving={saving}
                        isDirty={isDirty}
                        canEdit={canEdit}
                        theme={theme}
                        themeClasses={
                            themeClasses
                        }
                    />

                    <EditorsCard
                        editors={editors}
                        newEditorEmail={
                            newEditorEmail
                        }
                        setNewEditorEmail={
                            setNewEditorEmail
                        }
                        handleAddEditor={
                            handleAddEditor
                        }
                        handleRemoveEditor={
                            handleRemoveEditor
                        }
                        handleSave={
                            handleSave
                        }
                        saving={saving}
                        isDirty={isDirty}
                        canEdit={canEdit}
                        isAdmin={isAdmin}
                        theme={theme}
                        themeClasses={
                            themeClasses
                        }
                    />

                    <DangerZone
                        orgId={orgId}
                        deleteConfirm={
                            deleteConfirm
                        }
                        setDeleteConfirm={
                            setDeleteConfirm
                        }
                        handleDeleteOrganisation={
                            handleDeleteOrganisation
                        }
                        deleting={
                            deleting
                        }
                        isAdmin={isAdmin}
                        inputBase={
                            themeClasses.inputBase
                        }
                        theme={theme}
                    />
                </>
            )}
        </div>
    );
}