import { NextResponse } from "next/server";
import ScheduleSlot from "@/models/ScheduleSlot";
import { connectDB } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { teacherId: string } }
) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get("organisationId");

    const slots = await ScheduleSlot.find({
        organisationId,
        teacherId: params.teacherId
    }).sort({ day: 1, period: 1 });

    return NextResponse.json({ count: slots.length, data: slots });
}
