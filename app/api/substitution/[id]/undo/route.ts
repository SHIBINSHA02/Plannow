import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    console.log("--- UNDO ROUTE START ---");
    try {
        const { id } = await context.params;
        console.log("ID from params:", id);

        const { userId } = await auth();
        console.log("User ID from Clerk:", userId);

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        console.log("Database connected");

        const request = await SubstitutionRequest.findById(id);
        console.log("Request found in DB:", request ? "Yes" : "No");

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.requestedBy !== userId) {
            console.log("Access denied: request.requestedBy =", request.requestedBy, "userId =", userId);
            return NextResponse.json(
                { error: "You can only undo your own requests" },
                { status: 403 }
            );
        }

        if (request.status !== "pending") {
            return NextResponse.json(
                { error: `Cannot undo a request that is already ${request.status}` },
                { status: 400 }
            );
        }

        request.status = "cancelled";
        await request.save();
        const updated = await SubstitutionRequest.findById(id);
        console.log("Request status after save:", updated?.status);

        return NextResponse.json(request);
    } catch (error: any) {
        console.error("!!! UNDO ROUTE ERROR !!!", error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
                error: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
