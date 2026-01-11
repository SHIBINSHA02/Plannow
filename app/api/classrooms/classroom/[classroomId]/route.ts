import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import Teacher from "@/models/Teacher";

interface Params {
    params: { classroomId: string };
}

// GET classroom schedule
export async function GET(req: Request, { params }: Params) {
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

        const slots = await ScheduleSlot.find({
            organisationId,
            classroomId: params.classroomId
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
            classroomId: params.classroomId,
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
export async function PUT(req: Request, { params }: Params) {
    try {
        await connectDB();
        const body = await req.json();

        const updated = await Classroom.findOneAndUpdate(
            { classroomId: params.classroomId },
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

// DELETE classroom
export async function DELETE(req: Request, { params }: Params) {
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

        await Classroom.findOneAndDelete({
            classroomId: params.classroomId,
            organisationId
        });

        return NextResponse.json({ message: "Classroom deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
