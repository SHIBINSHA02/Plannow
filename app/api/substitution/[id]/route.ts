import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import SubstitutionRequest from "@/models/SubstitutionRequest";
import Organisation from "@/models/Organisation";

export const dynamic = "force-dynamic";

function getUserEmail(user: any): string | null {
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

async function assertOrgAdmin(organisationId: string, email: string) {
    const org = await Organisation.findOne({
        organisationId,
        $or: [{ adminName: email }, { editors: email }],
    }).lean();

    if (!org) {
        throw new Error("FORBIDDEN");
    }
}

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/substitution/[id]
 *
 * Admin-only management endpoint for substitution requests.
 *
 * - Reassign to a different teacher:
 *   body: { requestedTeacherId: string }
 *   → updates requestedTeacherId and resets status to "pending"
 *
 * - Cancel an assignment:
 *   body: { action: "cancel" }
 *   → marks the request as "rejected"
 */
export async function PATCH(req: Request, ctx: Params) {
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

        const { id } = await ctx.params;
        const body = await req.json();
        const { requestedTeacherId, action } = body ?? {};

        await connectDB();

        const requestDoc = await SubstitutionRequest.findById(id);
        if (!requestDoc) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 }
            );
        }

        try {
            await assertOrgAdmin(requestDoc.organisationId, email);
        } catch (err: any) {
            if (err?.message === "FORBIDDEN") {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }
            throw err;
        }

        if (action === "cancel") {
            requestDoc.status = "rejected";
            await requestDoc.save();
            return NextResponse.json(requestDoc);
        }

        if (!requestedTeacherId) {
            return NextResponse.json(
                {
                    error:
                        "Either action=\"cancel\" or requestedTeacherId is required",
                },
                { status: 400 }
            );
        }

        requestDoc.requestedTeacherId = requestedTeacherId;
        requestDoc.status = "pending";
        await requestDoc.save();

        return NextResponse.json(requestDoc);
    } catch (error: any) {
        console.error("PATCH /api/substitution/[id] error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to manage substitution request" },
            { status: 500 }
        );
    }
}

