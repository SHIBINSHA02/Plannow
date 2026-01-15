import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ScheduleSlot from "@/models/ScheduleSlot";

/* ---------- GET classroom schedule ---------- */
export async function GET(
    req: Request,
    { params }: { params: { classroomId: string } }
) {
    try {
        await connectDB();

        const { classroomId } = await params;

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

/* ---------- CREATE slot ---------- */
export async function POST(
    req: Request,
    { params }: { params: { classroomId: string } }
) {
    try {
        await connectDB();

        const { classroomId } =await  params;
        const body = await req.json();

        const slot = await ScheduleSlot.create({
            organisationId: body.organisationId,
            classroomId,
            teacherId: body.teacherId,
            subject: body.subject,
            day: body.day,
            period: body.period,
        });

        return NextResponse.json(slot, { status: 201 });
    } catch (error: any) {
        // Handle duplicate slot conflicts
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Slot already exists for this time" },
                { status: 409 }
            );
        }

        console.error("Schedule create error:", error);
        return NextResponse.json(
            { error: "Failed to create slot" },
            { status: 500 }
        );
    }
}

/* ---------- UPDATE slot ---------- */
export async function PATCH(
    req: Request,
    { params }: { params: { classroomId: string } }
) {
    try {
        await connectDB();

        const body = await req.json();
        const { slotId } = body;

        if (!slotId) {
            return NextResponse.json(
                { error: "slotId is required" },
                { status: 400 }
            );
        }

        const updated = await ScheduleSlot.findByIdAndUpdate(
            slotId,
            body,
            { new: true, runValidators: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Schedule update error:", error);
        return NextResponse.json(
            { error: "Failed to update slot" },
            { status: 500 }
        );
    }
}

/* ---------- DELETE slot ---------- */
export async function DELETE(
    req: Request,
    { params }: { params: { classroomId: string } }
) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get("slotId");

        if (!slotId) {
            return NextResponse.json(
                { error: "slotId is required" },
                { status: 400 }
            );
        }

        await ScheduleSlot.findByIdAndDelete(slotId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Schedule delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete slot" },
            { status: 500 }
        );
    }
}
