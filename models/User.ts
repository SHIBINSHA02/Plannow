import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    name: String,

    email: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },

    imageUrl: {
        type: String, 
    },

    role: {
        type: String,
        enum: ["ADMIN", "TEACHER", "STAFF"],
        default: "STAFF"
    },

    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.User ||
    mongoose.model("User", userSchema);
