import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import Teacher from "@/models/Teacher";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    try {
        await connectDB();

        // ✅ unwrap params (IMPORTANT)
        const { classroomId } = await params;

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { message: "organisationId is required" },
                { status: 400 }
            );
        }

        const classroom = await Classroom.findOne({
            classroomId,
            organisationId,
        }).lean();

        if (!classroom) {
            return NextResponse.json(
                { message: "Classroom not found" },
                { status: 404 }
            );
        }

        const teacherIds = Array.from(
            new Set(
                classroom.subjects
                    ?.map((s: any) => s.defaultTeacherId)
                    .filter(Boolean)
            )
        );

        if (teacherIds.length === 0) {
            return NextResponse.json([]);
        }

        const teachers = await Teacher.find({
            teacherId: { $in: teacherIds },
            organisations: organisationId,
        })
            .select("teacherId teacherName subjects")
            .lean();

        return NextResponse.json(teachers);

    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { message: err.message || "Server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/classrooms/classroom/[classroomId]/teachers?organisationId=[id]
 * Fetches all teachers assigned to the specified classroom across all subjects.
 * Useful for filtering schedules or identifying staff involved with a specific class.
 */
