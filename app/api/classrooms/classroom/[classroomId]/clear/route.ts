// app/api/classrooms/classroom/[classroomId]/clear/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import { decrementWorkload } from "@/lib/workload";

/* ---------- API Route to Clear Classroom Schedule ---------- */

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectDB();

        const { classroomId } = await params;

        if (!classroomId) {
            return NextResponse.json(
                { message: "classroomId is required" },
                { status: 400 }
            );
        }

        const classroom = await Classroom.findOne({ classroomId }).session(session);

        if (!classroom) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Classroom not found" },
                { status: 404 }
            );
        }

        const slots = await ScheduleSlot.find({ classroomId }).session(session);

        for (const slot of slots) {
            if (slot.teacherId && slot.organisationId) {
                await decrementWorkload({
                    organisationId: slot.organisationId,
                    teacherId: slot.teacherId,
                    day: slot.day,
                    period: slot.period,
                    session,
                });
            }
        }

        await ScheduleSlot.deleteMany({ classroomId }).session(session);

        const resetSubjects = (classroom.subjects || []).map(
            (sub: { subject: string; weeklyHours?: number; defaultTeacherId?: string; currentWeeklyHoursLeft?: number }) => ({
                subject: sub.subject,
                defaultTeacherId: sub.defaultTeacherId,
                weeklyHours: sub.weeklyHours,
                currentWeeklyHoursLeft: sub.weeklyHours ?? sub.currentWeeklyHoursLeft ?? 0,
            })
        );

        await Classroom.updateOne(
            { classroomId },
            { $set: { subjects: resetSubjects } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            {
                success: true,
                message: "Classroom schedule cleared successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

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
