import { Schema, model, models } from "mongoose";

/* ---------- Type ---------- */
export interface IScheduleSlot {
    organisationId: string;
    classroomId: string;
    teacherId?: string;
    subject?: string;
    day: number;
    period: number;
}

const ScheduleSlotSchema = new Schema<IScheduleSlot>(
    {
        organisationId: {
            type: String,
            required: true,
        },
        classroomId: {
            type: String,
            required: true,
        },
        teacherId: {
            type: String,
            default: undefined,
        },
        subject: {
            type: String,
            default: undefined,
        },
        day: {
            type: Number,
            required: true,
        },
        period: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

/* 🔐 Prevent duplicate slots */
ScheduleSlotSchema.index(
    {
        organisationId: 1,
        classroomId: 1,
        teacherId: 1,
        subject: 1,
        day: 1,
        period: 1
    },
    { unique: true }
);


/* ✅ At least one of teacherId or subject must exist */
ScheduleSlotSchema.pre("save", function () {
    if (!this.teacherId && !this.subject) {
        throw new Error("Either teacherId or subject must be provided");
    }
});

export default models.ScheduleSlot ||
    model<IScheduleSlot>("ScheduleSlot", ScheduleSlotSchema);
