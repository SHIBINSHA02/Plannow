// app/api/automate/[classroomid]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { optimizeClassroomSchedule, performClassroomAutoAssignment } from "@/lib/automate/classroom";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ classroomid: string }> }
) {
    await connectDB();

    const { classroomid } = await params;
    const { searchParams } = new URL(request.url);
    const organisationId = searchParams.get("organisationId");

    if (!organisationId) {
        return NextResponse.json(
            { error: "organisationId is required" },
            { status: 400 }
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await performClassroomAutoAssignment(organisationId,classroomid, session);
// if (result.success) {
//     await optimizeClassroomSchedule(organisationId,classroomid, session);
// }

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(result);
    } catch (err: unknown) {
        await session.abortTransaction();
        session.endSession();

        const message = err instanceof Error ? err.message : "Auto-assign failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
