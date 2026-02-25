import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";

/* -------------------------------------------------------
   GET: Fetch organisations user has access to
------------------------------------------------------- */
export async function GET() {
    try {
        /* ---------- Auth ---------- */
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email =
            clerkUser.emailAddresses?.[0]?.emailAddress ?? null;

        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        /* ---------- DB ---------- */
        await connectDB();

        /* ---------- Fetch ONLY accessible organisations ---------- */
        const organisations = await Organisation.find({
            $or: [
                { adminName: email },
                { editors: { $in: [email] } }
            ]
        })
            .select("organisationId organisationName adminName")
            .sort({ organisationName: 1 })
            .lean();

        return NextResponse.json(
            { organisations },
            { status: 200 }
        );
    } catch (error) {
        console.error("Fetch organisations error:", error);

        return NextResponse.json(
            { message: "Failed to fetch organisations" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/organisation
 * Fetches all organizations the current user has access to (Admin or Editor).
 * Returns a simplified list of organization objects.
 */
