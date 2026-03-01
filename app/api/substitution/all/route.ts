import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   GET /api/substitution/all?organisationId=...
   Returns ALL substitution requests for an organisation.
   Used for admin dashboard overviews.
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

        // Note: We might want to add a check here in the future 
        // to verify that the requesting user is actually an admin 
        // for this organisation. For now, matching existing patterns.

        const requests = await SubstitutionRequest.find({
            organisationId,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("GET /api/substitution/all error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch all requests" },
            { status: 500 }
        );
    }
}
