import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";

export const dynamic = "force-dynamic";

/* ---------- Helpers ---------- */
function getUserEmail(user: any): string | null {
    return (
        user?.emailAddresses?.[0]?.emailAddress ?? null
    );
}

/* ---------- PATCH (EDIT ORG IMAGES) ---------- */
export async function PATCH(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationId } = await context.params;
        const { profileImageUrl, backgroundImageUrl } = await req.json();

        await connectDB();

        // ✅ AUTHORISATION CHECK (ADMIN / EDITOR ONLY)
        const organisation = await Organisation.findOneAndUpdate(
            {
                organisationId,
                $or: [
                    { adminName: email },
                    { editors: email },
                ],
            },
            {
                $set: {
                    profileImageUrl: profileImageUrl ?? null,
                    backgroundImageUrl: backgroundImageUrl ?? null,
                },
            },
            { new: true, runValidators: true }
        );

        if (!organisation) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            organisation,
        });
    } catch (error) {
        console.error("PATCH organisation error:", error);
        return NextResponse.json(
            { message: "Failed to update organisation" },
            { status: 500 }
        );
    }
}

/* ---------- GET (FETCH ORG) ---------- */
export async function GET(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const email = getUserEmail(clerkUser);
        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { organisationId } = await context.params;

        await connectDB();

        // ✅ AUTHORISATION CHECK
        const organisation = await Organisation.findOne({
            organisationId,
            $or: [
                { adminName: email },
                { editors: email },
            ],
        });

        if (!organisation) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        // Optional: expose edit permission to client
        const canEdit =
            organisation.adminName === email ||
            organisation.editors.includes(email);

        return NextResponse.json({
            organisation,
            canEdit,
        });
    } catch (error) {
        console.error("organisation GET error:", error);
        return NextResponse.json(
            { message: "Failed to fetch organisation" },
            { status: 500 }
        );
    }
}
