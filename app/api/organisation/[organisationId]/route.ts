import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";

export const dynamic = "force-dynamic";

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

        // ✅ MUST await params
        const { organisationId } = await context.params;

        await connectDB();

        const organisation = await Organisation.findOne({
            organisationId,
        });

        if (!organisation) {
            return NextResponse.json(
                { message: "Organisation not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(organisation);
    } catch (error) {
        console.error("organisation GET error:", error);
        return NextResponse.json(
            { message: "Failed to fetch organisation" },
            { status: 500 }
        );
    }
}
