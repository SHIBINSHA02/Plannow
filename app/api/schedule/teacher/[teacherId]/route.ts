import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ScheduleSlot from "@/models/ScheduleSlot";

export async function GET(
    req: Request,
    context: { params: Promise<{ teacherId: string }> }
) {
    await connectDB();

    // ✅ FIX: await params
    const { teacherId } = await context.params;

    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get("organisationId");

    if (!organisationId) {
        return NextResponse.json(
            { message: "organisationId is required" },
            { status: 400 }
        );
    }

    const slots = await ScheduleSlot.find({
        teacherId,
        organisationId
    }).sort({ day: 1, period: 1 });

    return NextResponse.json(slots);
}
