import mongoose, { Schema, model, models } from "mongoose";

const OnboardingSubmissionSchema = new Schema(
    {
        organisationId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["TEACHER", "CLASSROOM"],
            required: true,
        },
        data: {
            type: Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
            index: true,
        },
        submittedBy: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default models.OnboardingSubmission ||
    model("OnboardingSubmission", OnboardingSubmissionSchema);
