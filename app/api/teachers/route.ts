import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
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
            profileImageUrl = null,
            metadata = {}
        } = await req.json();

        if (!teacherName || !email || !organisationId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // 1. Check if teacher already exists by email
        const existingTeacher = await Teacher.findOne({ email: normalizedEmail });

        if (existingTeacher) {
            // 2. Add organisationId to their list if not already present
            const updatedTeacher = await Teacher.findOneAndUpdate(
                { email: normalizedEmail },
                {
                    $addToSet: { organisations: organisationId },
                    $set: {
                        // Optionally update name or subjects if provided
                        teacherName: teacherName,
                        subjects: subjects.length > 0 ? subjects : existingTeacher.subjects,
                        profileImageUrl: profileImageUrl || existingTeacher.profileImageUrl,
                        metadata: { ...existingTeacher.metadata, ...metadata }
                    }
                },
                { new: true }
            );

            return NextResponse.json(updatedTeacher, { status: 200 });
        }

        // 3. Create new teacher if not found
        const teacher = await Teacher.create({
            teacherId: `T-${nanoid(6)}`,
            teacherName,
            email: normalizedEmail,
            subjects,
            profileImageUrl,
            organisations: [organisationId],
            metadata
        });

        return NextResponse.json(teacher, { status: 201 });

    } catch (error: any) {
        console.error("Create/Update teacher error:", error);
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
 * UPDATE TEACHER
 * PATCH /api/teachers
 */
export async function PATCH(req: Request) {
    try {
        await connectDB();

        const {
            teacherId,
            teacherName,
            subjects,
            profileImageUrl,
            organisationId,
            metadata
        } = await req.json();

        if (!teacherId) {
            return NextResponse.json(
                { error: "teacherId is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (teacherName !== undefined) updateData.teacherName = teacherName;
        if (subjects !== undefined) updateData.subjects = subjects;
        if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
        if (metadata !== undefined) updateData.metadata = metadata;

        console.log("Updating teacher image for ID:", teacherId, "Image length:", profileImageUrl?.length || 0);
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { teacherId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedTeacher) {
            console.error("Teacher NOT found during PATCH for ID:", teacherId);
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 }
            );
        }

        console.log("Teacher image updated successfully in DB for:", updatedTeacher.teacherName);

        if (organisationId) {
            revalidatePath(`/dashboard/organisations/${organisationId}/teachers`, "page");
            revalidatePath(`/dashboard/organisations/${organisationId}/teachers/${teacherId}/profile`, "page");
            console.log("Revalidated paths for organisation:", organisationId);
        }

        return NextResponse.json(updatedTeacher);

    } catch (error: any) {
        console.error("Update teacher error:", error);
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
