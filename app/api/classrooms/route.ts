import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import User from "@/models/User";
import { nanoid } from "nanoid";



/**
 * CREATE CLASSROOM
 */


export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            organisationId,
            classroomId,
            className,
            department,
            adminEmail,
            editorEmails = [],
            subjects = [],
        } = body;

        /* ---------- Required Fields ---------- */

        if (!organisationId || !className || !adminEmail) {
            return NextResponse.json(
                {
                    message:
                        "organisationId, className, adminEmail are required",
                },
                { status: 400 }
            );
        }

        /* ---------- Validate Subjects ---------- */

        if (!Array.isArray(subjects) || subjects.length === 0) {
            return NextResponse.json(
                { message: "At least one subject is required" },
                { status: 400 }
            );
        }

        /* ---------- Normalize Subjects ---------- */
        const normalizedSubjects = subjects.map((s: any) => ({
            subject: s.subject,
            weeklyHours: Number(s.weeklyHours),
            defaultTeacherId: s.defaultTeacherId || null,
        }));

        /* ---------- Create Classroom ---------- */

        const classroom = await Classroom.create({
            organisationId,
            classroomId: classroomId || `C-${nanoid(6)}`,
            className,
            department,
            adminEmail,
            editorEmails,
            subjects: normalizedSubjects,
        });

        return NextResponse.json(classroom, { status: 201 });

    } catch (error: any) {
        console.error("Create classroom error:", error);

        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}


/**
 * GET CLASSROOMS (with admin profile image)
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { message: "organisationId required" },
                { status: 400 }
            );
        }

        // 1️⃣ Fetch classrooms
        const classrooms = await Classroom.find({ organisationId }).lean();

        if (classrooms.length === 0) {
            return NextResponse.json([]);
        }

        // 2️⃣ Collect admin emails
        const adminEmails = classrooms
            .map((cls: any) => cls.adminEmail)
            .filter(Boolean);

        // 3️⃣ Fetch matching users by email
        const users = await User.find({
            email: { $in: adminEmails },
        })
            .select("email name imageUrl")
            .lean();

        // 4️⃣ Map email → profile data
        const userByEmail: Record<
            string,
            { name?: string; imageUrl?: string | null }
        > = {};

        users.forEach((u: any) => {
            userByEmail[u.email] = {
                name: u.name,
                imageUrl: u.imageUrl ?? null,
            };
        });

        // 5️⃣ Attach admin info to classrooms
        const enriched = classrooms.map((cls: any) => ({
            ...cls,
            admin: userByEmail[cls.adminEmail] ?? null,
        }));

        return NextResponse.json(enriched);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
