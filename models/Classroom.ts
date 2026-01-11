import mongoose, { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema(
    {
        subject: { type: String, required: true },
        defaultTeacherId: { type: String },
        weeklyHours: { type: Number }
    },
    { _id: true }
);

const ClassroomSchema = new Schema(
    {
        organisationId: {
            type: String,
            required: true,
            index: true
        },
        classroomId: {
            type: String,
            required: true,
            unique: true
        },
        className: {
            type: String,
            required: true
        },
        department: {
            type: String
        },
        subjects: [SubjectSchema]
    },
    { timestamps: true }
);

export default models.Classroom || model("Classroom", ClassroomSchema);
