import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import ScheduleSlot from "@/models/ScheduleSlot";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import ProfileHeader from "./_components/ProfileHeader";
export const dynamic = "force-dynamic";

/* ---------------- Constants ---------------- */

const DAY_MAP: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
};

const DAYS = [1, 2, 3, 4, 5];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ---------------- Page ---------------- */

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
    console.log(`[Server] Fetched teacher ${teacher.teacherName}: profileImageUrl is ${teacher.profileImageUrl ? 'present (' + teacher.profileImageUrl.length + ' chars)' : 'MISSING'}`);

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

    /* -------- Build Map: day-period → slots[] -------- */

    const scheduleMap = new Map<string, any[]>();

    for (const slot of slots) {
        const key = `${slot.day}-${slot.period}`;
        if (!scheduleMap.has(key)) scheduleMap.set(key, []);
        scheduleMap.get(key)!.push(slot);
    }

    /* ---------------- UI ---------------- */
    // ... (data fetching stays exactly the same)

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-10">

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

                {/* Timetable - clean, compact, high readability */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shadow-blue-700/20">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="size-5 text-gray-600" />
                            Weekly Schedule
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-700 rounded-lg">
                                    <th className="w-32 px-6 py-4 text-left font-medium text-white border-b border-r border-gray-200">
                                        Day
                                    </th>
                                    {PERIODS.map(p => (
                                        <th
                                            key={p}
                                            className="px-4 py-4 text-center font-medium text-white border-b border-r border-gray-200"
                                        >
                                            P{p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => (
                                    <tr key={day} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-5 font-medium text-gray-800 border-r border-gray-200 bg-gray-50">
                                            {DAY_MAP[day]}
                                        </td>
                                        {PERIODS.map(period => {
                                            const slots = scheduleMap.get(`${day}-${period}`) || [];
                                            return (
                                                <td
                                                    key={period}
                                                    className="px-3 py-4 border-l border-gray-200 align-top min-h-[9rem]"
                                                >
                                                    {slots.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {slots.map((slot, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="border border-gray-300 rounded px-3 py-2 bg-white text-sm"
                                                                >
                                                                    <div className="font-medium text-gray-900">
                                                                        {slot.subject || '—'}
                                                                    </div>
                                                                    <div className="text-gray-600 text-xs mt-0.5">
                                                                        {slot.className}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                                            Free
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}