import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // ✅ Ensure user exists (no false 404s)
        const user = await User.findOneAndUpdate(
            { clerkUserId: clerkUser.id },
            {
                clerkUserId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress,
                name: clerkUser.fullName ?? "",
            },
            { upsert: true, new: true }
        );

        // ✅ Fetch organisations (may be empty)
        const organisations = await Organisation.find({
            adminName: user.email,
        });

        // ✅ ZERO organisations is NOT an error
        return NextResponse.json({
            count: organisations.length,
            organisations, // [] when none exist
        });
    } catch (error) {
        console.error("my-organisations error:", error);
        return NextResponse.json(
            { message: "Failed to fetch organisations" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/organisation/my-organisations
 * Fetches all organizations where the current user is the administrator.
 * Automatically syncs the user record if it doesn't exist.
 */
