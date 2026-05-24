// app/(protected)/dashboard/organisations/[organisationId]/manage/types.ts
// app/(protected)/dashboard/organisations/[organisationId]/manage/types.ts

export type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    editors: string[];
    workingDays: number;
    periodsPerDay: number;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

export type OrganisationResponse = {
    organisation: Organisation;
    canEdit: boolean;
    isAdmin?: boolean;
};