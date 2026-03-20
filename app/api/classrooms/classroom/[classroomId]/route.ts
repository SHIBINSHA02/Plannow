import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import Teacher from "@/models/Teacher";

interface Params {
    params: { classroomId: string };
}

// GET classroom schedule
export async function GET(
    req: Request,
    context: { params: Promise<{ classroomId: string }> }
) {
    try {
        const { classroomId } = await context.params;
        await connectDB();

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { message: "organisationId required" },
                { status: 400 }
            );
        }

        const slots = await ScheduleSlot.find({
            organisationId,
            classroomId: classroomId
        })
            .sort({ day: 1, period: 1 })
            .lean();

        const teacherIds = [...new Set(slots.map(s => s.teacherId))];

        const teachers = await Teacher.find({
            teacherId: { $in: teacherIds },
            organisationId
        })
            .select("teacherId teacherName")
            .lean();

        const teacherMap = Object.fromEntries(
            teachers.map(t => [t.teacherId, t.teacherName])
        );

        const enriched = slots.map(slot => ({
            ...slot,
            teacherName: teacherMap[slot.teacherId] || "Unknown"
        }));

        return NextResponse.json({
            classroomId: classroomId,
            organisationId,
            totalSlots: enriched.length,
            schedule: enriched
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

// PUT update classroom
export async function PUT(
    req: Request,
    context: { params: Promise<{ classroomId: string }> }
) {
    try {
        const { classroomId } = await context.params;
        await connectDB();
        const body = await req.json();

        const updated = await Classroom.findOneAndUpdate(
            { classroomId: classroomId },
            body,
            { new: true }
        );

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
                { message: "organisationId required" },
                { status: 400 }
            );
        }

        const deleted = await Classroom.findOneAndDelete({
            classroomId,
            organisationId,
        });

        if (!deleted) {
            return NextResponse.json(
                { message: "Classroom not found" },
                { status: 404 }
            );
        }

        // Delete all schedule slots associated with this classroom
        await ScheduleSlot.deleteMany({
            classroomId,
            organisationId,
        });

        return NextResponse.json({
            message: "Classroom deleted successfully",
        });
    } catch (error: any) {
        console.error("DELETE classroom error:", error);

        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * API Routes for a specific Classroom
 * 
 * GET /api/classrooms/classroom/[classroomId]?organisationId=[id]
 * - Fetches the complete schedule for a specific classroom.
 * - Enriches schedule slots with teacher names.
 * 
 * PUT /api/classrooms/classroom/[classroomId]
 * - Updates classroom details (name, subjects, etc.).
 * 
 * DELETE /api/classrooms/classroom/[classroomId]?organisationId=[id]
 * - Deletes the classroom from the organization.
 */