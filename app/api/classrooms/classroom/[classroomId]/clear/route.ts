// app/api/classrooms/classroom/[classroomId]/clear/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import Schedule from "@/models/ScheduleSlot";

/* ---------- API Route to Clear Classroom Schedule ---------- */

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    try {
        await connectDB();

        // IMPORTANT
        const { classroomId } = await params;

        if (!classroomId) {
            return NextResponse.json(
                { message: "classroomId is required" },
                { status: 400 }
            );
        }

        // Check if classroom exists
        const classroom = await Classroom.findOne({ classroomId });

        if (!classroom) {
            return NextResponse.json(
                { message: "Classroom not found" },
                { status: 404 }
            );
        }

        // Delete all schedule entries
        await Schedule.deleteMany({ classroomId });

        return NextResponse.json(
            {
                success: true,
                message: "Classroom schedule cleared successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error clearing classroom schedule:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}