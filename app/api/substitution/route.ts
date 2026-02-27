import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import SubstitutionRequest from "@/models/SubstitutionRequest";

export const dynamic = "force-dynamic";

/* ---------- LIST REQUESTS (by org + user) ---------- */
export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const requests = await SubstitutionRequest.find({
            organisationId,
            requestedBy: userId,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("GET /api/substitution error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch requests" },
            { status: 500 }
        );
    }
}

/* ---------- CREATE REQUEST ---------- */
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const {
            organisationId,
            slotId,
            classroomId,
            day,
            period,
            subject,
            originalTeacherId,
            requestedTeacherId,
        } = body;

        if (
            !organisationId ||
            !slotId ||
            !classroomId ||
            !requestedTeacherId ||
            day == null ||
            period == null
        ) {
            return NextResponse.json(
                {
                    error:
                        "organisationId, slotId, classroomId, day, period, requestedTeacherId required",
                },
                { status: 400 }
            );
        }

        // Check for existing pending request for same slot and teacher
        const existing = await SubstitutionRequest.findOne({
            organisationId,
            slotId,
            requestedTeacherId,
            status: "pending",
        });

        if (existing) {
            return NextResponse.json(
                {
                    error:
                        "A pending request already exists for this teacher for this slot.",
                },
                { status: 400 }
            );
        }

        const created = await SubstitutionRequest.create({
            organisationId,
            slotId,
            classroomId,
            day,
            period,
            subject,
            originalTeacherId,
            requestedTeacherId,
            requestedBy: userId,
            status: "pending",
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/substitution error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create request" },
            { status: 500 }
        );
    }
}

/**
 * API Routes for Substitution Requests
 * 
 * GET /api/substitution?organisationId=[id]
 * - Lists all substitution requests created by the current user in an organization.
 * 
 * POST /api/substitution
 * - Creates a new substitution request.
 * - Requires organisationId, slotId, classroomId, teachers, and timing info.
 */
