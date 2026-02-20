import mongoose, { Schema, model, models } from "mongoose";

/**
 * ClericalSchema
 *
 * A clerical staff member can hold multiple teacher IDs (one per organisation).
 * The compound unique index on (clerkUserId + teacherIds.organisationId) is
 * enforced in application code (see POST /api/profile/clerical).
 */

export interface IClericalTeacherEntry {
    teacherId: string;
    organisationId: string;
}

export interface IClerical {
    clerkUserId: string;
    teacherIds: IClericalTeacherEntry[];
}

const ClericalTeacherEntrySchema = new Schema<IClericalTeacherEntry>(
    {
        teacherId: { type: String, required: true },
        organisationId: { type: String, required: true },
    },
    { _id: false }
);

const ClericalSchema = new Schema<IClerical>(
    {
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        teacherIds: {
            type: [ClericalTeacherEntrySchema],
            default: [],
        },
    },
    { timestamps: true }
);

export default models.Clerical || model<IClerical>("Clerical", ClericalSchema);
