import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { performAutoAssignment } from "@/lib/automate/assignment";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ organisationId: string }> }
) {
    await connectDB();
    const { organisationId } = await params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await performAutoAssignment(organisationId, session);

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(result);

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
