import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import ScheduleSlot from "@/models/ScheduleSlot";
import { notFound } from "next/navigation";
import ProfileHeader from "./_components/ProfileHeader";
import TimetableWrapper from "./_components/TimetableWrapper";

export const dynamic = "force-dynamic";

const DAY_MAP: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
};

const DAYS = [1, 2, 3, 4, 5];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default async function TeacherProfile({
    params,
}: {
    params: Promise<{ organisationId: string; teacherid: string }>;
}) {
    const { organisationId, teacherid } = await params;

    await connectDB();

    /* -------- Fetch Teacher -------- */
    const teacher = await Teacher.findOne({
        teacherId: teacherid,
        organisations: organisationId,
    }).lean();

    if (!teacher) return notFound();

    /* -------- Fetch Schedule Slots -------- */
    const slots = await ScheduleSlot.aggregate([
        {
            $match: {
                organisationId,
                teacherId: teacherid,
            },
        },
        {
            $lookup: {
                from: "classrooms",
                localField: "classroomId",
                foreignField: "classroomId",
                as: "classroom",
            },
        },
        {
            $unwind: {
                path: "$classroom",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                className: {
                    $ifNull: ["$classroom.className", "—"],
                },
            },
        },
        {
            $project: {
                classroom: 0,
                __v: 0,
            },
        },
    ]);

    /* -------- Build Plain Object for Client Component Serialization -------- */
    const serializedSchedule: Record<string, any[]> = {};

    for (const slot of slots) {
        // Essential: convert MongoDB IDs / structures to plain stringable entries
        const plainSlot = JSON.parse(JSON.stringify(slot));
        const key = `${plainSlot.day}-${plainSlot.period}`;

        if (!serializedSchedule[key]) {
            serializedSchedule[key] = [];
        }
        serializedSchedule[key].push(plainSlot);
    }

    return (
        <div className="w-full px-1 py-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Profile Header */}
                <ProfileHeader
                    teacher={{
                        teacherId: teacher.teacherId,
                        teacherName: teacher.teacherName,
                        email: teacher.email,
                        subjects: teacher.subjects || [],
                        profileImageUrl: teacher.profileImageUrl,
                    }}
                    organisationId={organisationId}
                />

                {/* Theme-Responsive Weekly Schedule Client Component */}
                <TimetableWrapper
                    DAYS={DAYS}
                    PERIODS={PERIODS}
                    DAY_MAP={DAY_MAP}
                    serializedSchedule={serializedSchedule}
                />

            </div>
        </div>
    );
}