import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import Classroom from "@/models/Classroom";
import Teacher from "@/models/Teacher";
import ScheduleSlot from "@/models/ScheduleSlot";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
/* ---------- Helpers ---------- */
function getUserEmail(user: any): string | null {
    return (
        user?.emailAddresses?.[0]?.emailAddress ?? null
    );
}

/* ---------- PATCH (EDIT ORG IMAGES) ---------- */
export async function PATCH(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationId } = await context.params;
        const { profileImageUrl, backgroundImageUrl } = await req.json();

        await connectDB();

        // ✅ AUTHORISATION CHECK (ADMIN / EDITOR ONLY)
        const organisation = await Organisation.findOneAndUpdate(
            {
                organisationId,
                $or: [
                    { adminName: email },
                    { editors: email },
                ],
            },
            {
                $set: {
                    profileImageUrl: profileImageUrl ?? null,
                    backgroundImageUrl: backgroundImageUrl ?? null,
                },
            },
            { new: true, runValidators: true }
        );

        if (!organisation) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            organisation,
        });
    } catch (error) {
        console.error("PATCH organisation error:", error);
        return NextResponse.json(
            { message: "Failed to update organisation" },
            { status: 500 }
        );
    }
}

/* ---------- GET (FETCH ORG) ---------- */
export async function GET(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationId } = await context.params;

        await connectDB();

        // ✅ AUTHORISATION CHECK
        const organisation = await Organisation.findOne({
            organisationId,
            $or: [
                { adminName: email },
                { editors: email },
            ],
        });

        if (!organisation) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        // Optional: expose edit permission to client
        const canEdit =
            organisation.adminName === email ||
            organisation.editors.includes(email);

        return NextResponse.json({
            organisation,
            canEdit,
        });
    } catch (error) {
        console.error("organisation GET error:", error);
        return NextResponse.json(
            { message: "Failed to fetch organisation" },
            { status: 500 }
        );
    }
}


export async function DELETE(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationId } = await context.params;

        /* ✅ DELETE ORGANISATION (ADMIN ONLY) */
        const organisation = await Organisation.findOneAndDelete(
            {
                organisationId,
                adminName: email, // ADMIN ONLY
            },
            { session }
        );

        if (!organisation) {
            await session.abortTransaction();
            session.endSession();

            return NextResponse.json(
                { message: "Forbidden or organisation not found" },
                { status: 403 }
            );
        }

        /* ✅ CASCADE DELETE */

        // Delete all classrooms
        await Classroom.deleteMany(
            { organisationId },
            { session }
        );

        // Delete all teachers linked to org
        await Teacher.deleteMany(
            { organisations: organisationId },
            { session }
        );

        // Delete all schedule slots
        await ScheduleSlot.deleteMany(
            { organisationId },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            message: "Organisation and related data deleted successfully",
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();

        console.error("Cascade delete error:", error);

        return NextResponse.json(
            { message: "Failed to delete organisation" },
            { status: 500 }
        );
    }
}
