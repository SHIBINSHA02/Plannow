import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Clerical from "@/models/Clerical";
import Organisation from "@/models/Organisation";
import Teacher from "@/models/Teacher";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   GET /api/profile/clerical
   Returns the signed-in user's clerical profile including resolved
   organisation names.
---------------------------------------------------------------- */
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const clerical = await Clerical.findOne({ clerkUserId: userId }).lean();
        if (!clerical) {
            return NextResponse.json({ clerical: null });
        }

        // Resolve org names for each entry
        const orgIds = clerical.teacherIds.map((t: { teacherId: string; organisationId: string }) => t.organisationId);
        const orgs = await Organisation.find({ organisationId: { $in: orgIds } })
            .select("organisationId organisationName")
            .lean();

        const orgMap: Record<string, string> = {};
        for (const o of orgs) {
            orgMap[o.organisationId] = o.organisationName;
        }

        const entries = clerical.teacherIds.map((t: { teacherId: string; organisationId: string }) => ({
            teacherId: t.teacherId,
            organisationId: t.organisationId,
            organisationName: orgMap[t.organisationId] ?? t.organisationId,
        }));

        return NextResponse.json({ clerical: { clerkUserId: userId, teacherIds: entries } });
    } catch (error: any) {
        console.error("GET /api/profile/clerical error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch clerical profile" },
            { status: 500 }
        );
    }
}

/* ----------------------------------------------------------------
   POST /api/profile/clerical
   Body: { teacherId: string; organisationId: string }

   Links the current user to a teacherId inside an organisation.
   Returns 409 if the user already has a teacherId in that organisation.
---------------------------------------------------------------- */
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { teacherId, organisationId } = await req.json();
        if (!teacherId || !organisationId) {
            return NextResponse.json(
                { error: "teacherId and organisationId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Make sure the teacherId actually belongs to this organisation
        const teacher = await Teacher.findOne({ teacherId }).lean();
        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }
        if (!teacher.organisations.includes(organisationId)) {
            return NextResponse.json(
                { error: "Teacher does not belong to this organisation" },
                { status: 400 }
            );
        }

        // Check uniqueness: one teacherId per organisation per clerical
        const existing = await Clerical.findOne({
            clerkUserId: userId,
            "teacherIds.organisationId": organisationId,
        });
        if (existing) {
            return NextResponse.json(
                { error: "You already have a teacher ID registered for this organisation" },
                { status: 409 }
            );
        }

        // Upsert: push the new entry
        await Clerical.findOneAndUpdate(
            { clerkUserId: userId },
            { $push: { teacherIds: { teacherId, organisationId } } },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/profile/clerical error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create clerical profile" },
            { status: 500 }
        );
    }
}
