// seed.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// ✅ ESM imports MUST end with .js
import Organisation from "./models/Organisation.js";
import Teacher from "./models/Teacher.js";
import Classroom from "./models/Classroom.js";
import ScheduleSlot from "./models/ScheduleSlot.js";
import TeacherWorkload from "./models/TeacherWorkload.js";
import User from "./models/User.js";
import Clerical from "./models/Clerical.js";
import SubstitutionRequest from "./models/SubstitutionRequest.js";

dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
});

const ADMIN_EMAIL = "shibin24666@gmail.com";

// Clerk IDs provided by the user
const USER_1_CLERK_ID = "user_38QXmEPPiwpcW9LjBbcWIp0w9T1";
const USER_1_EMAIL = "aiderived@gmail.com";

const USER_2_CLERK_ID = "user_371jdIwXo5jWlgB5JZCdLaWnmSj";
const USER_2_EMAIL = "shibin24888@gmail.com";

const USER_3_CLERK_ID = "user_371bQmIztU3YWDzyotCFGIQRIRP";
const USER_3_EMAIL = "shibin24666@gmail.com";

async function seed() {
    try {
        console.log("🔌 Connecting to DB...");

        if (!process.env.MONGODB_URI) {
            throw new Error("❌ MONGODB_URI env missing");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        /* ================= HARD RESET (DEV SAFE) ================= */

        // 🔥 DROP schedule slots collection completely (removes indexes too)
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("❌ Database connection failed: db is undefined");
        }

        const scheduleCollections = await db
            .listCollections({ name: "scheduleslots" })
            .toArray();

        if (scheduleCollections.length > 0) {
            await db.dropCollection("scheduleslots");
            console.log("🧹 scheduleslots collection dropped (data + indexes)");
        }

        /* ================= FIX TEACHER INDEXES (CRITICAL) ================= */

        const teacherCollection = db.collection("teachers");
        const teacherIndexes = await teacherCollection.indexes();

        for (const index of teacherIndexes) {
            if (
                index.name === "email_1" ||
                index.name === "organisationId_1_email_1"
            ) {
                await teacherCollection.dropIndex(index.name);
                console.log(`🧹 Dropped index: ${index.name}`);
            }
        }

        /* ================= FIX USER INDEXES (FIX DUPLICATE EMAIL) ================= */

        const userCollection = db.collection("users");
        const userIndexes = await userCollection.indexes();

        for (const index of userIndexes) {
            if (index.name === "email_1") {
                await userCollection.dropIndex(index.name);
                console.log(`🧹 Dropped index: ${index.name} on users collection`);
            }
        }

        /* ================= CLEAN OTHER DATA ================= */

        await Promise.all([
            Organisation.deleteMany({}),
            Teacher.deleteMany({}),
            Classroom.deleteMany({}),
            TeacherWorkload.deleteMany({}),
            User.deleteMany({}),
            Clerical.deleteMany({}),
            SubstitutionRequest.deleteMany({}),
        ]);

        console.log("🧹 All collections cleared (including User & Clerical)");

        /* ================= ORGANISATIONS ================= */

        await Organisation.insertMany([
            {
                organisationId: "ORG1",
                organisationName: "Planora Demo College",
                adminName: ADMIN_EMAIL,
                workingDays: 5,
                periodsPerDay: 6,
                editors: [ADMIN_EMAIL],
            },
            {
                organisationId: "ORG2",
                organisationName: "Planora Tech Institute",
                adminName: ADMIN_EMAIL,
                workingDays: 5,
                periodsPerDay: 6,
                editors: [ADMIN_EMAIL],
            },
        ]);

        console.log("🏫 Organisations created");

        /* ================= TEACHERS ================= */
        await Teacher.insertMany(
            [
                {
                    teacherId: "T-1",
                    teacherName: "Alice Johnson",
                    email: USER_1_EMAIL,
                    subjects: ["Maths", "Physics"],
                    organisations: ["ORG1"],
                },
                {
                    teacherId: "T-2",
                    teacherName: "Bob Smith",
                    email: USER_2_EMAIL,
                    subjects: ["Chemistry"],
                    organisations: ["ORG1", "ORG2"],
                },
                {
                    teacherId: "T-3",
                    teacherName: "Clara Lee",
                    email: USER_3_EMAIL,
                    subjects: ["CS"],
                    organisations: ["ORG2"],
                },
                {
                    teacherId: "T-4",
                    teacherName: "David Park",
                    email: USER_1_EMAIL,
                    subjects: ["Physics"],
                    organisations: ["ORG1", "ORG2"],
                },
            ],
            { ordered: false }
        );

        console.log("👩‍🏫 Teachers created");

        /* ================= USERS (CLERK) ================= */

        await User.insertMany([
            {
                clerkUserId: USER_1_CLERK_ID,
                name: "Alice Park",
                email: USER_1_EMAIL,
                role: "TEACHER",
            },
            {
                clerkUserId: USER_2_CLERK_ID,
                name: "Bob Smith",
                email: USER_2_EMAIL,
                role: "TEACHER",
            },
            {
                clerkUserId: USER_3_CLERK_ID,
                name: "Clara Lee",
                email: USER_3_EMAIL,
                role: "TEACHER",
            },
        ]);

        console.log("👤 Users created");

        /* ================= CLERICAL PROFILES (LINKING) ================= */

        await Clerical.insertMany([
            {
                clerkUserId: USER_1_CLERK_ID,
                teacherIds: [
                    { teacherId: "T-1", organisationId: "ORG1" },
                    { teacherId: "T-4", organisationId: "ORG2" },
                ],
            },
            {
                clerkUserId: USER_2_CLERK_ID,
                teacherIds: [{ teacherId: "T-2", organisationId: "ORG1" }],
            },
            {
                clerkUserId: USER_3_CLERK_ID,
                teacherIds: [{ teacherId: "T-3", organisationId: "ORG2" }],
            },
        ]);

        console.log("🔗 Clerical profiles (multi-org linking) created");

        /* ================= CLASSROOMS ================= */

        await Classroom.insertMany(
            [
                {
                    organisationId: "ORG1",
                    classroomId: "ORG1-C1",
                    className: "CSE A",
                    department: "CSE",
                    adminEmail: ADMIN_EMAIL,
                    editorEmails: [ADMIN_EMAIL],
                    subjects: [
                        { subject: "Maths", defaultTeacherId: "T-1", weeklyHours: 4 },
                        { subject: "Physics", defaultTeacherId: "T-4", weeklyHours: 3 },
                    ],
                },
                {
                    organisationId: "ORG1",
                    classroomId: "ORG1-C2",
                    className: "CSE B",
                    department: "CSE",
                    adminEmail: ADMIN_EMAIL,
                    editorEmails: [ADMIN_EMAIL],
                    subjects: [
                        { subject: "Chemistry", defaultTeacherId: "T-2", weeklyHours: 3 },
                    ],
                },
                {
                    organisationId: "ORG2",
                    classroomId: "ORG2-C1",
                    className: "IT A",
                    department: "IT",
                    adminEmail: ADMIN_EMAIL,
                    editorEmails: [ADMIN_EMAIL],
                    subjects: [
                        { subject: "CS", defaultTeacherId: "T-3", weeklyHours: 5 },
                    ],
                },
            ],
            { ordered: false }
        );

        console.log("🏷️ Classrooms created");

        /* ================= SCHEDULE SLOTS ================= */

        await ScheduleSlot.insertMany(
            [
                {
                    organisationId: "ORG1",
                    classroomId: "ORG1-C1",
                    teacherId: "T-1",
                    subject: "Maths",
                    day: 1,
                    period: 1,
                },
                {
                    organisationId: "ORG1",
                    classroomId: "ORG1-C1",
                    teacherId: "T-4",
                    subject: "Physics",
                    day: 1,
                    period: 1,
                },
                {
                    organisationId: "ORG1",
                    classroomId: "ORG1-C2",
                    teacherId: "T-2",
                    subject: "Chemistry",
                    day: 2,
                    period: 3,
                },
                {
                    organisationId: "ORG2",
                    classroomId: "ORG2-C1",
                    teacherId: "T-3",
                    subject: "CS",
                    day: 1,
                    period: 2,
                },
            ],
            { ordered: false }
        );

        console.log("📅 Schedule slots created");
        console.log("✅ SEEDING COMPLETED SUCCESSFULLY");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
