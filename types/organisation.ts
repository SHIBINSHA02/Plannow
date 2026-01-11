export interface Organisation {
    _id?: string;                // MongoDB ObjectId (optional on frontend)
    organisationId: string;      // Human-readable ID like "ORG2"
    organisationName: string;
    adminName: string;

    workingDays?: number;
    periodsPerDay?: number;
    editors?: string[];

    createdAt?: string;
    updatedAt?: string;
}
