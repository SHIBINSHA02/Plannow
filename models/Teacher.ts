import mongoose, { Schema, model, models } from "mongoose";

const TeacherSchema = new Schema(
    {
        teacherId: {
            type: String,
            required: true,
            unique: true
        },

        teacherName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true, // 🔥 GLOBAL UNIQUE
            trim: true
        },

        subjects: {
            type: [String],
            default: []
        },

        organisations: {
            type: [String], 
            default: []
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

export default models.Teacher || model("Teacher", TeacherSchema);
