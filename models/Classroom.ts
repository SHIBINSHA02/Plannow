import mongoose, { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema(
    {
        subject: { type: String, required: true },
        defaultTeacherId: { type: String },
        weeklyHours: { type: Number },
        currentWeeklyHoursLeft: {
            type: Number,
            default: function (this: any) {
                return this.weeklyHours;
            }
        },
    },
    { _id: true }
);

const ClassroomSchema = new Schema(
    {
        organisationId: {
            type: String,
            required: true,
            index: true,
        },

        classroomId: {
            type: String,
            required: true,
            unique: true,
        },

        className: {
            type: String,
            required: true,
        },

        department: {
            type: String,
        },


        adminEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid admin email"],
        },


        editorEmails: [
            {
                type: String,
                lowercase: true,
                trim: true,
                match: [/^\S+@\S+\.\S+$/, "Invalid editor email"],
            },
        ],

        subjects: [SubjectSchema],
    },
    { timestamps: true }
);

export default models.Classroom || model("Classroom", ClassroomSchema);
