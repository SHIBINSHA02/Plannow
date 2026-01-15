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

dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
});

const ADMIN_EMAIL = "shibin24666@gmail.com";

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
        const collections = await mongoose.connection.db
            .listCollections({ name: "scheduleslots" })
            .toArray();

        if (collections.length > 0) {
            await mongoose.connection.db.dropCollection("scheduleslots");
            console.log("🧹 scheduleslots collection dropped (data + indexes)");
        }

        /* ================= CLEAN OTHER DATA ================= */

        await Promise.all([
            Organisation.deleteMany({}),
            Teacher.deleteMany({}),
            Classroom.deleteMany({}),
            TeacherWorkload.deleteMany({}),
        ]);

        console.log("🧹 Other collections cleared");

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
                    email: "alice@college.com",
                    subjects: ["Maths", "Physics"],
                    organisations: ["ORG1"],
                },
                {
                    teacherId: "T-2",
                    teacherName: "Bob Smith",
                    email: "bob@college.com",
                    subjects: ["Chemistry"],
                    organisations: ["ORG1", "ORG2"],
                },
                {
                    teacherId: "T-3",
                    teacherName: "Clara Lee",
                    email: "clara@college.com",
                    subjects: ["CS"],
                    organisations: ["ORG2"],
                },
                {
                    teacherId: "T-4",
                    teacherName: "David Park",
                    email: "david@college.com",
                    subjects: ["Physics"],
                    organisations: ["ORG1", "ORG2"],
                },
            ],
            { ordered: false }
        );

        console.log("👩‍🏫 Teachers created");

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
                {
                    organisationId: "ORG2",
                    classroomId: "ORG2-C2",
                    className: "AI A",
                    department: "AI",
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
                    period: 1, // parallel teacher ✅
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
