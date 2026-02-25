import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ScheduleSlot from "@/models/ScheduleSlot";

/* ---------- GET CLASSROOM SCHEDULE ---------- */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    await connectDB();

    try {
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
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

/* ---------- CREATE SLOT (NO DUPLICATES) ---------- */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    await connectDB();

    try {
        const { classroomId } = await params;
        const body = await req.json();

        const {
            organisationId,
            teacherId,
            subject,
            day,
            period,
        } = body;

        if (!organisationId || !day || !period) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ PREVENT DUPLICATE CREATION
        const existing = await ScheduleSlot.findOne({
            organisationId,
            classroomId,
            day,
            period,
            teacherId: teacherId ?? undefined,
            subject: subject ?? undefined,
        });

        if (existing) {
            // Slot already exists → frontend must PATCH instead
            return NextResponse.json(existing, { status: 409 });
        }

        const created = await ScheduleSlot.create({
            organisationId,
            classroomId,
            teacherId,
            subject,
            day,
            period,
        });

        return NextResponse.json(created, { status: 201 });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

/**
 * API Routes for Classroom Schedule Management
 * 
 * GET /api/schedule/classroom/[classroomId]?organisationId=[id]
 * - Fetches all schedule slots for a specific classroom.
 * 
 * POST /api/schedule/classroom/[classroomId]
 * - Creates a new schedule slot for a classroom.
 * - Prevents duplicates for the same day, period, and teacher/subject combo.
 */
