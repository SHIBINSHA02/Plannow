import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";

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

        /* ---------- Clerk (App Router SAFE) ---------- */
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        /* ---------- Collect ALL user emails ---------- */
        const emails = user.emailAddresses
            .map(e => e.emailAddress.toLowerCase());

        console.log("Clerk emails:", emails);

        /* ---------- Find teachers ---------- */
        const teachers = await Teacher.find({
            email: { $in: emails }
        });

        console.log(
            "Matched teachers:",
            teachers.map(t => ({
                teacherId: t.teacherId,
                email: t.email
            }))
        );

        return NextResponse.json({ teachers });

    } catch (error) {
        console.error("GET /api/profile/teacher error:", error);

        return NextResponse.json(
            { message: "Failed to fetch teacher profiles" },
            { status: 500 }
        );
    }
}
