import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import OnboardingToken from "@/models/OnboardingToken";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function getUserEmail(user: any): string | null {
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

export async function POST(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { organisationId } = await context.params;
        const { type, expiresInHours, instructions } = await req.json();

        if (!type || !["TEACHER", "CLASSROOM"].includes(type)) {
            return NextResponse.json({ message: "Invalid type" }, { status: 400 });
        }

        const hours = Number(expiresInHours) || 24;

        await connectDB();

        // Check if user is Admin or Editor for this organisation
        const organisation = await Organisation.findOne({
            organisationId,
            $or: [{ adminName: email }, { editors: email }],
        });

        if (!organisation) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const tokenId = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);

        const token = await OnboardingToken.create({
            tokenId,
            organisationId,
            type,
            expiresAt,
            instructions: instructions || "",
        });

        return NextResponse.json({ token });
    } catch (error) {
        console.error("POST onboarding token error:", error);
        return NextResponse.json(
            { message: "Failed to generate token" },
            { status: 500 }
        );
    }
}
