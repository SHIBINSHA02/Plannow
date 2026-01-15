import { Schema, model, models } from "mongoose";

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
        organisationId: { type: String, required: true },
        classroomId: { type: String, required: true },
        teacherId: { type: String },
        subject: { type: String },
        day: { type: Number, required: true },
        period: { type: Number, required: true },
    },
    { timestamps: true }
);


ScheduleSlotSchema.index(
    {
        organisationId: 1,
        classroomId: 1,
        day: 1,
        period: 1,
        teacherId: 1,
        subject: 1,
    },
    { unique: true }
);

export default models.ScheduleSlot ||
    model<IScheduleSlot>("ScheduleSlot", ScheduleSlotSchema);
