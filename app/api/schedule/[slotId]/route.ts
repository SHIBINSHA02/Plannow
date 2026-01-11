import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ScheduleSlot from "@/models/ScheduleSlot";
import { decrementWorkload } from "@/lib/workload";
import { connectDB } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { slotId: string } }
) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        const slot = await ScheduleSlot.findOne({
            _id: params.slotId,
            organisationId
        }).session(session);

        if (!slot) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        await decrementWorkload({
            organisationId,
            teacherId: slot.teacherId,
            day: slot.day,
            period: slot.period,
            session
        });

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
