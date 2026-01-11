import mongoose, { Schema, model, models } from "mongoose";

const ScheduleSlotSchema = new Schema(
    {
        organisationId: {
            type: String,
            required: true
        },
        classroomId: {
            type: String,
            required: true
        },
        teacherId: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        day: {
            type: Number,
            required: true
        },
        period: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

/* 🔐 Prevent duplicate slots */
ScheduleSlotSchema.index(
    { organisationId: 1, classroomId: 1, day: 1, period: 1 },
    { unique: true }
);

export default models.ScheduleSlot ||
    model("ScheduleSlot", ScheduleSlotSchema);
