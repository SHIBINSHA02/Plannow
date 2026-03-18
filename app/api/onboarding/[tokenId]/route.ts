import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import OnboardingToken from "@/models/OnboardingToken";
import OnboardingSubmission from "@/models/OnboardingSubmission";
import Organisation from "@/models/Organisation";

export const dynamic = "force-dynamic";

function getUserEmail(user: any): string | null {
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

// GET: Validate token & return info
export async function GET(
    req: Request,
    context: { params: Promise<{ tokenId: string }> }
) {
    try {
        const { tokenId } = await context.params;

        await connectDB();

        const token = await OnboardingToken.findOne({ tokenId });
        if (!token) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 404 });
        }

        if (new Date() > token.expiresAt) {
            return NextResponse.json({ message: "Token expired" }, { status: 400 });
        }

        const organisation = await Organisation.findOne({ organisationId: token.organisationId });

        return NextResponse.json({
            valid: true,
            type: token.type,
            organisationName: organisation?.organisationName || "Unknown Organisation",
            organisationId: token.organisationId,
            instructions: token.instructions || "",
        });
    } catch (error) {
        console.error("GET onboarding token info error:", error);
        return NextResponse.json(
            { message: "Failed to fetch token info" },
            { status: 500 }
        );
    }
}

// POST: Submit onboarding data
export async function POST(
    req: Request,
    context: { params: Promise<{ tokenId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            // Require login so we know who submitted it
            return NextResponse.json({ message: "Unauthorized login required" }, { status: 401 });
        }

        const clerkUserId = clerkUser.id;
        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { tokenId } = await context.params;
        const data = await req.json();

        await connectDB();

        const token = await OnboardingToken.findOne({ tokenId });
        if (!token) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 404 });
        }

        // Inject Clerk User ID, Name, and Email for Teachers
        if (token.type === "TEACHER") {
            data.teacherId = clerkUserId;
            data.email = email;

            const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
            data.teacherName = fullName || email.split('@')[0];
        }

        const submission = await OnboardingSubmission.create({
            organisationId: token.organisationId,
            type: token.type,
            data: data,
            status: "PENDING",
            submittedBy: email
        });

        return NextResponse.json({ success: true, submissionId: submission._id });
    } catch (error) {
        console.error("POST onboarding submission error:", error);
        return NextResponse.json(
            { message: "Failed to submit onboarding data" },
            { status: 500 }
        );
    }
}
