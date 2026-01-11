import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ScheduleSlot from "@/models/ScheduleSlot";
import { incrementWorkload, decrementWorkload } from "@/lib/workload";

import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const body = await req.json();
        const { organisationId, classroomId, teacherId, subject, day, period } = body;

        if (!organisationId || !classroomId || !teacherId || !subject) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const existing = await ScheduleSlot.findOne({
            organisationId,
            classroomId,
            day,
            period
        }).session(session);

        if (existing && existing.teacherId !== teacherId) {
            // remove old teacher workload
            await decrementWorkload({
                organisationId,
                teacherId: existing.teacherId,
                day,
                period,
                session
            });
        }

        const slot = await ScheduleSlot.findOneAndUpdate(
            { organisationId, classroomId, day, period },
            { $set: { teacherId, subject } },
            { upsert: true, new: true, session }
        );

        await incrementWorkload({
            organisationId,
            teacherId,
            day,
            period,
            session
        });

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({ success: true, slot });

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get("organisationId");

    const slots = await ScheduleSlot.find({ organisationId })
        .sort({ day: 1, period: 1 });

    return NextResponse.json({ count: slots.length, data: slots });
}
