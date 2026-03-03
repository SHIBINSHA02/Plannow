import { Schema, model, models } from "mongoose";

export interface ISubstitutionRequest {
    organisationId: string;
    slotId: string;
    classroomId: string;
    day: number;
    period: number;
    subject?: string;
    originalTeacherId?: string;
    requestedTeacherId: string;
    requestedBy: string; // clerk user id
    status: "pending" | "accepted" | "rejected" | "cancelled";
}

const SubstitutionRequestSchema = new Schema<ISubstitutionRequest>(
    {
        organisationId: { type: String, required: true, index: true },
        slotId: { type: String, required: true },
        classroomId: { type: String, required: true },
        day: { type: Number, required: true },
        period: { type: Number, required: true },
        subject: { type: String },
        originalTeacherId: { type: String },
        requestedTeacherId: { type: String, required: true },
        requestedBy: { type: String, required: true, index: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

SubstitutionRequestSchema.index(
    { organisationId: 1, requestedBy: 1 },
    { background: true }
);

export default models.SubstitutionRequest ||
    model<ISubstitutionRequest>("SubstitutionRequest", SubstitutionRequestSchema);
