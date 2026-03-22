import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import OnboardingToken from "@/models/OnboardingToken";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserEmail(user: any): string | null {
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}


export async function PATCH(
    req: Request,
    context: { params: Promise<{ organisationId: string; tokenId: string }> }
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

        const { organisationId, tokenId } = await context.params;
        const { instructions } = await req.json();

        await connectDB();

        // Check if user is Admin or Editor for this organisation
        const organisation = await Organisation.findOne({
            organisationId,
            $or: [{ adminName: email }, { editors: email }],
        });

        if (!organisation) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Update token instructions
        const token = await OnboardingToken.findOneAndUpdate(
            { tokenId, organisationId },
            { instructions: instructions || "" },
            { new: true }
        );

        if (!token) {
            return NextResponse.json({ message: "Token not found" }, { status: 404 });
        }

        return NextResponse.json({ token });
    } catch (error) {
        console.error("PATCH onboarding token error:", error);
        return NextResponse.json(
            { message: "Failed to update token" },
            { status: 500 }
        );
    }
}
