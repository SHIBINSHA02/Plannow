import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Clerical from "@/models/Clerical";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------
   PATCH /api/substitution/[id]/status
   Body: { status: "accepted" | "rejected" }

   Only the clerical whose teacherId is the requestedTeacherId for
   this request may accept or reject it.
---------------------------------------------------------------- */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();
        if (!["accepted", "rejected"].includes(status)) {
            return NextResponse.json(
                { error: "status must be 'accepted' or 'rejected'" },
                { status: 400 }
            );
        }

        await connectDB();

        const request = await SubstitutionRequest.findById(params.id);
        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Verify the caller is the intended clerical
        const clerical = await Clerical.findOne({
            clerkUserId: userId,
            "teacherIds.teacherId": request.requestedTeacherId,
            "teacherIds.organisationId": request.organisationId,
        }).lean();

        if (!clerical) {
            return NextResponse.json(
                { error: "You are not authorised to update this request" },
                { status: 403 }
            );
        }

        request.status = status;
        await request.save();

        return NextResponse.json(request);
    } catch (error: any) {
        console.error("PATCH /api/substitution/[id]/status error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to update request status" },
            { status: 500 }
        );
    }
}
