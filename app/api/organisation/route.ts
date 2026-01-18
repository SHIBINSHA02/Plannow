import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";

/* -------------------------------------------------------
   GET: Fetch ALL organisations (global)
------------------------------------------------------- */
export async function GET() {
    try {
        /* ---------- Auth ---------- */
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        /* ---------- DB ---------- */
        await connectDB();

        /* ---------- Fetch all organisations ---------- */
        const organisations = await Organisation.find({})
            .select("_id organisationName adminName organisationId")
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
