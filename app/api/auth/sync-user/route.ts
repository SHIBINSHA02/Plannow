import { auth } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { NextResponse } from "next/server";

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { message: "Not authenticated" },
            { status: 401 }
        );
    }

    await syncUser(userId);

    return NextResponse.json({ success: true });
}

/**
 * POST /api/auth/sync-user
 * Syncs the current Clerk user with the local MongoDB database.
 * This route is typically called after a successful clerk authentication to ensure the user exists in our records.
 */
