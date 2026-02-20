import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Clerical from "@/models/Clerical";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   GET /api/substitution/incoming?organisationId=...
   Returns substitution requests where requestedTeacherId matches
   the clerical user's teacherId for that organisation.
---------------------------------------------------------------- */
export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the clerical doc for this user & org
        const clerical = await Clerical.findOne({
            clerkUserId: userId,
            "teacherIds.organisationId": organisationId,
        }).lean();

        if (!clerical) {
            return NextResponse.json([]);
        }

        const entry = clerical.teacherIds.find(
            (t: { teacherId: string; organisationId: string }) =>
                t.organisationId === organisationId
        );
        if (!entry) {
            return NextResponse.json([]);
        }

        const requests = await SubstitutionRequest.find({
            organisationId,
            requestedTeacherId: entry.teacherId,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("GET /api/substitution/incoming error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch incoming requests" },
            { status: 500 }
        );
    }
}
