import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import { nanoid } from "nanoid";

/**
 * CREATE TEACHER (under an organisation)
 */
export async function POST(req: Request) {
    try {
        await connectDB();

        const {
            teacherName,
            email,
            subjects = [],
            organisationId,
            metadata = {}
        } = await req.json();

        if (!teacherName || !email || !organisationId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const teacher = await Teacher.create({
            teacherId: `T-${nanoid(6)}`, // ✅ generated here
            teacherName,
            email,
            subjects,
            organisations: [organisationId],
            metadata
        });

        return NextResponse.json(teacher, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET TEACHERS BY ORGANISATION
 * /api/teachers?organisationId=ORG_ID
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        const teachers = await Teacher.find({
            organisations: organisationId
        });

        return NextResponse.json(teachers);

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * API Routes for Teachers
 * 
 * POST /api/teachers
 * - Creates a new teacher record within an organization.
 * - Automatically generates a teacherId.
 * 
 * GET /api/teachers?organisationId=[id]
 * - Lists all teachers belonging to a specific organization.
 */
