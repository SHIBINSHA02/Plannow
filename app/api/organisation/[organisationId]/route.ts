import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import Classroom from "@/models/Classroom";
import Teacher from "@/models/Teacher";
import ScheduleSlot from "@/models/ScheduleSlot";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import TeacherWorkload from "@/models/TeacherWorkload";
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
        const { organisationId } = await context.params;
        console.log("Organisation PATCH hit for ID:", organisationId);

        const clerkUser = await currentUser();
        if (!clerkUser) {
            console.error("Clerk user not found in PATCH organisation");
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

        const body = await req.json();
        const {
            profileImageUrl,
            backgroundImageUrl,
            allowParallelAssignments,
            organisationName,
            workingDays,
            periodsPerDay,
            editors,
        } = body ?? {};

        await connectDB();

        const existingOrganisation = await Organisation.findOne({
            organisationId,
            $or: [{ adminName: email }, { editors: email }],
        }).lean();

        if (!existingOrganisation) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const isAdmin = existingOrganisation.adminName === email;

        const setUpdates: Record<string, any> = {};

        if (profileImageUrl !== undefined) setUpdates.profileImageUrl = profileImageUrl;
        if (backgroundImageUrl !== undefined) setUpdates.backgroundImageUrl = backgroundImageUrl;
        if (allowParallelAssignments !== undefined) setUpdates.allowParallelAssignments = allowParallelAssignments;

        if (organisationName !== undefined) setUpdates.organisationName = organisationName;
        if (workingDays !== undefined) setUpdates.workingDays = workingDays;
        if (periodsPerDay !== undefined) setUpdates.periodsPerDay = periodsPerDay;

        // Editors list is admin-only (prevents editors from escalating privileges)
        if (editors !== undefined) {
            if (!isAdmin) {
                return NextResponse.json(
                    { message: "Forbidden" },
                    { status: 403 }
                );
            }
            setUpdates.editors = editors;
        }

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
                    ...setUpdates,
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
        console.error("PATCH organisation error:", JSON.stringify(error, null, 2));
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
        const isAdmin = organisation.adminName === email;

        return NextResponse.json({
            organisation,
            canEdit,
            isAdmin,
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
        await TeacherWorkload.deleteMany(
            { organisationId },
            { session }
        )

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

/**
 * API Routes for a specific Organisation
 * 
 * PATCH /api/organisation/[organisationId]
 * - Updates organization metadata (profile image, background image).
 * - Requires Admin or Editor permissions.
 * 
 * GET /api/organisation/[organisationId]
 * - Fetches specific organization details.
 * - Returns whether the current user has edit permissions.
 * 
 * DELETE /api/organisation/[organisationId]
 * - Performs a cascade delete of the organization.
 * - Removes all linked classrooms, teachers, and schedule slots.
 * - restricted to Admin only.
 */
