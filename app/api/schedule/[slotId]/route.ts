import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ScheduleSlot from "@/models/ScheduleSlot";
import { decrementWorkload } from "@/lib/workload";
import { connectDB } from "@/lib/db";

/* ---------- UPDATE SLOT ---------- */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    await connectDB();

    try {
        const { slotId } = await params;
        const body = await req.json();

        const { organisationId, teacherId, subject } = body;

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        const updated = await ScheduleSlot.findOneAndUpdate(
            { _id: slotId, organisationId },
            {
                teacherId: teacherId ?? undefined,
                subject: subject ?? undefined,
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { message: "Not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

/* ---------- DELETE SLOT ---------- */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { slotId } = await params;

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        const slot = await ScheduleSlot.findOne({
            _id: slotId,
            organisationId
        }).session(session);

        if (!slot) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        if (slot.teacherId) {
            await decrementWorkload({
                organisationId,
                teacherId: slot.teacherId,
                day: slot.day,
                period: slot.period,
                session
            });
        }

        await ScheduleSlot.deleteOne({ _id: slot._id }).session(session);

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({ success: true });

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
