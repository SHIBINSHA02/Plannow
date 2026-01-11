import mongoose, { Schema, model, models } from "mongoose";

const TeacherWorkloadSchema = new Schema(
    {
        organisationId: { type: String, required: true },
        teacherId: { type: String, required: true },
        day: { type: Number, required: true },
        period: { type: Number, required: true },
        workload: { type: Number, default: 0 }
    },
    { timestamps: true }
);

TeacherWorkloadSchema.index(
    { organisationId: 1, teacherId: 1, day: 1, period: 1 },
    { unique: true }
);

export default models.TeacherWorkload ||
    model("TeacherWorkload", TeacherWorkloadSchema);
