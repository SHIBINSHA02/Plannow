export interface Organisation {
    _id?: string;                
    organisationId: string;      
    organisationName: string;
    adminName: string;

    workingDays?: number;
    periodsPerDay?: number;
    editors?: string[];

    // ✅ NEW (optional image fields)
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;

    createdAt?: string;
    updatedAt?: string;
}
