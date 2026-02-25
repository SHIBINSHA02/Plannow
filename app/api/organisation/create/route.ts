import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationName } = await req.json();
        if (!organisationName) {
            return NextResponse.json(
                { message: "Organisation name required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            clerkUserId: clerkUser.id
        });

        if (!user || !user.email) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const organisationId = `ORG${Date.now().toString().slice(-4)}`;

        const organisation = await Organisation.create({
            organisationId,
            organisationName,
            adminName: user.email
        });

        return NextResponse.json({ organisation }, { status: 201 });
    } catch (error) {
        console.error("Create organisation error:", error);
        return NextResponse.json(
            { message: "Failed to create organisation" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/organisation/create
 * Creates a new organization with the current user as the administrator.
 * Automatically generates a unique OrganisationId.
 */
