import { auth } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/syncUser";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } =await auth();

    if (!userId) {
        return NextResponse.json(
            { message: "Not authenticated" },
            { status: 401 }
        );
    }

    await syncUser(userId);

    return NextResponse.json({ success: true });
}
