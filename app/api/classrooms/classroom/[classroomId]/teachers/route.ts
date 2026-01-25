import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import Teacher from "@/models/Teacher";

export async function GET(
    req: Request,
    context: { params: Promise<{ classroomId: string }> }
) {
    try {
        await connectDB();

        const { classroomId } = await context.params;

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

        /* ✅ DERIVE teacherIds FROM subjects */
        const teacherIds = classroom.subjects
            ?.map((s: any) => s.defaultTeacherId)
            .filter(Boolean);

        if (!teacherIds || teacherIds.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const teachers = await Teacher.find({
            teacherId: { $in: teacherIds },
            organisations: organisationId,
        })
            .select("teacherId teacherName subjects")
            .lean();

        return NextResponse.json(teachers, { status: 200 });

    } catch (error: any) {
        console.error("GET classroom teachers error:", error);

        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
