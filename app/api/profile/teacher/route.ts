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

        /* ---------- Clerk ---------- */
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        const emails = user.emailAddresses.map(e =>
            e.emailAddress.toLowerCase()
        );

        /* ---------- Aggregation ---------- */
        const teachers = await Teacher.aggregate([
            {
                $match: {
                    email: { $in: emails }
                }
            },
            {
                $lookup: {
                    from: "organisations",          // Mongo collection name
                    localField: "organisations",    // ["ORG1"]
                    foreignField: "organisationId", // "ORG1"
                    as: "organisationDetails"
                }
            },
            {
                $addFields: {
                    organisations: {
                        $map: {
                            input: "$organisationDetails",
                            as: "org",
                            in: {
                                id: "$$org.organisationId",
                                name: "$$org.organisationName"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    organisationDetails: 0
                }
            }
        ]);

        return NextResponse.json({ teachers });

    } catch (error) {
        console.error("GET /api/profile/teacher error:", error);

        return NextResponse.json(
            { message: "Failed to fetch teacher profiles" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/profile/teacher
 * Fetches teacher profile records associated with the signed-in user's email addresses.
 * Uses aggregation to join with organization details for a complete view of staff roles.
 */
