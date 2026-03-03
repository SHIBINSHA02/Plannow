import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   GET /api/substitution/all?organisationId=...
   Returns substitution requests for an organisation limited
   to the last 7 days for admin overview.
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

        // Only show last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const requests = await SubstitutionRequest.find({
            organisationId,
            createdAt: { $gte: sevenDaysAgo },
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

