// app/(protected)/dashboard/organisations/[organisationId]/manage/useOrganisationForm.ts
"use client";

import { useMemo, useState } from "react";

import { Organisation } from "./types";

export default function useOrganisationForm(
    organisation: Organisation | null
) {
    const [organisationName, setOrganisationName] =
        useState("");

    const [workingDays, setWorkingDays] =
        useState<number>(5);

    const [periodsPerDay, setPeriodsPerDay] =
        useState<number>(6);

    const [allowParallel, setAllowParallel] =
        useState<boolean>(false);

    const [profileUrl, setProfileUrl] =
        useState("");

    const [bgUrl, setBgUrl] = useState("");

    const [editors, setEditors] = useState<
        string[]
    >([]);

    const isDirty = useMemo(() => {
        if (!organisation) return false;

        return (
            organisationName !==
                organisation.organisationName ||
            workingDays !==
                organisation.workingDays ||
            periodsPerDay !==
                organisation.periodsPerDay ||
            allowParallel !==
                (organisation.allowParallelAssignments ??
                    false) ||
            (profileUrl || "") !==
                (organisation.profileImageUrl ??
                    "") ||
            (bgUrl || "") !==
                (organisation.backgroundImageUrl ??
                    "") ||
            JSON.stringify(
                editors.slice().sort()
            ) !==
                JSON.stringify(
                    (
                        organisation.editors ?? []
                    )
                        .slice()
                        .sort()
                )
        );
    }, [
        organisation,
        organisationName,
        workingDays,
        periodsPerDay,
        allowParallel,
        profileUrl,
        bgUrl,
        editors,
    ]);

    return {
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
    };
}