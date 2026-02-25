import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ScheduleSlot from "@/models/ScheduleSlot";

export async function GET(
    req: Request,
    context: { params: Promise<{ teacherId: string }> }
) {
    try {
        /* ---------- DB ---------- */
        await connectDB();

        /* ---------- Params ---------- */
        const { teacherId } = await context.params;
        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { message: "organisationId is required" },
                { status: 400 }
            );
        }

        /* ---------- Aggregation ---------- */
        const slots = await ScheduleSlot.aggregate([
            {
                $match: {
                    teacherId,
                    organisationId
                }
            },
            {
                $lookup: {
                    from: "classrooms",          // mongoose auto-plural
                    localField: "classroomId",
                    foreignField: "classroomId",
                    as: "classroom"
                }
            },
            {
                $unwind: {
                    path: "$classroom",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    className: {
                        $ifNull: ["$classroom.className", "Unknown Class"]
                    }
                }
            },
            {
                $project: {
                    classroom: 0,
                    __v: 0
                }
            },
            {
                $sort: { day: 1, period: 1 }
            }
        ]);

        /* ---------- Response ---------- */
        return NextResponse.json(slots);

    } catch (error) {
        console.error("Teacher schedule fetch error:", error);

        return NextResponse.json(
            { message: "Failed to fetch teacher schedule" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/schedule/teacher/[teacherId]?organisationId=[id]
 * Fetches the complete schedule for a specific teacher.
 * Joins with the classrooms collection to provide human-readable class names for each slot.
 */
