import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ScheduleSlot from "@/models/ScheduleSlot";

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
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        const slots = await ScheduleSlot.find({
            organisationId,
            classroomId,
        }).sort({ day: 1, period: 1 });

        return NextResponse.json(slots);
    } catch (error) {
        console.error("Schedule fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch schedule" },
            { status: 500 }
        );
    }
}
