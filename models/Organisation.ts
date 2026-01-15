import mongoose, { Schema, models, model } from "mongoose";

const organisationSchema = new Schema(
    {
        organisationId: { type: String, required: true, unique: true },
        organisationName: { type: String, required: true },
        adminName: { type: String, required: true },
        workingDays: { type: Number, default: 5 },
        periodsPerDay: { type: Number, default: 6 },
        editors: { type: [String], default: [] },

        profileImageUrl: { type: String, default: null },
        backgroundImageUrl: { type: String, default: null },
    },
    { timestamps: true }
);

const Organisation =
    models.Organisation || model("Organisation", organisationSchema);

export default Organisation;
