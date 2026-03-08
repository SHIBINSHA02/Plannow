import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ScheduleSlot from "@/models/ScheduleSlot";
import { connectDB } from "@/lib/db";
import { incrementWorkload, decrementWorkload } from "@/lib/workload";
import { updateSubjectHours } from "@/lib/classroom";

/* ---------- UPDATE SLOT ---------- */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

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

        const existing = await ScheduleSlot.findOne({
            _id: slotId,
            organisationId
        }).session(session);

        if (!existing) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Slot not found" },
                { status: 404 }
            );
        }

        // --- WORKLOAD UPDATE ---
        if (teacherId !== undefined && existing.teacherId !== teacherId) {
            if (existing.teacherId) {
                await decrementWorkload({
                    organisationId,
                    teacherId: existing.teacherId,
                    day: existing.day,
                    period: existing.period,
                    session
                });
            }
            if (teacherId) {
                await incrementWorkload({
                    organisationId,
                    teacherId,
                    day: existing.day,
                    period: existing.period,
                    session
                });
            }
        }

        // --- SUBJECT HOURS UPDATE ---
        if (subject !== undefined && existing.subject !== subject) {
            if (existing.subject) {
                await updateSubjectHours({
                    organisationId,
                    classroomId: existing.classroomId,
                    subjectName: existing.subject,
                    delta: 1,
                    session
                });
            }
            if (subject) {
                await updateSubjectHours({
                    organisationId,
                    classroomId: existing.classroomId,
                    subjectName: subject,
                    delta: -1,
                    session
                });
            }
        }

        const updated = await ScheduleSlot.findOneAndUpdate(
            { _id: slotId, organisationId },
            {
                teacherId: teacherId ?? existing.teacherId,
                subject: subject ?? existing.subject,
            },
            { new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(updated);

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
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

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        const slot = await ScheduleSlot.findOne({
            _id: slotId,
            organisationId,
        }).session(session);

        if (!slot) {
            return NextResponse.json(
                { message: "Slot not found" },
                { status: 404 }
            );
        }

        if (slot.teacherId) {
            await decrementWorkload({
                organisationId,
                teacherId: slot.teacherId,
                day: slot.day,
                period: slot.period,
                session,
            });
        }

        if (slot.subject) {
            await updateSubjectHours({
                organisationId,
                classroomId: slot.classroomId,
                subjectName: slot.subject,
                delta: 1,
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

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

/**
 * API Routes for a individual Schedule Slot
 * 
 * PATCH /api/schedule/[slotId]
 * - Updates specific fields of a schedule slot (teacher, subject).
 * 
 * DELETE /api/schedule/[slotId]?organisationId=[id]
 * - Deletes a schedule slot.
 * - Automatically decrements the assigned teacher's workload.
 */
