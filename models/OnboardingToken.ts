import mongoose, { Schema, model, models } from "mongoose";

const OnboardingTokenSchema = new Schema(
    {
        tokenId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
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
        instructions: {
            type: String,
            default: "",
        },
        expiresAt: {
            type: Date,
            required: true,
            // 0 means it will be removed at the exact time of expiresAt
            index: { expires: 0 },
        },
    },
    { timestamps: true, strict: false }
);

if (models.OnboardingToken) {
    delete models.OnboardingToken;
}

export default models.OnboardingToken ||
    model("OnboardingToken", OnboardingTokenSchema);
