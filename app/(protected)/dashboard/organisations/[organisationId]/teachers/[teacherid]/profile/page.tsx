import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import ScheduleSlot from "@/models/ScheduleSlot";
import { notFound } from "next/navigation";
import { Calendar, Mail, Building2 } from "lucide-react";

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
    const teacherid = "T-1";
    const organisationId = "ORG1";

    // const { organisationId, teacherid } = await params;

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
                    $ifNull: ["$classroom.className", "Unknown Class"],
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

    /* -------- Build Map: day-period -> slots[] -------- */

    const scheduleMap = new Map<string, any[]>();

    for (const slot of slots) {
        const key = `${slot.day}-${slot.period}`;

        if (!scheduleMap.has(key)) {
            scheduleMap.set(key, []);
        }

        scheduleMap.get(key)!.push(slot);
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ---------- Header ---------- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-semibold">
                                {teacher.teacherName}
                            </h1>

                            <div className="flex gap-4 mt-2 text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {teacher.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {teacher.teacherId}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            {teacher.subjects?.map((s: string) => (
                                <span
                                    key={s}
                                    className="px-2 py-1 rounded-full text-center bg-blue-50 text-blue-700 text-sm font-medium"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ---------- Schedule Grid ---------- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">
                            Weekly Schedule
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">

                            {/* Header */}
                            <div className="grid grid-cols-9 bg-blue-700 border-b border-gray-200">
                                <div className="p-4 text-center font-medium text-white">
                                    Day
                                </div>
                                {PERIODS.map((p) => (
                                    <div
                                        key={p}
                                        className="p-4 text-center font-semibold text-white"
                                    >
                                        P{p}
                                    </div>
                                ))}
                            </div>

                            {/* Body */}
                            {DAYS.map((day) => (
                                <div
                                    key={day}
                                    className="grid grid-cols-9 border-b border-gray-300 hover:bg-gray-50/50"
                                >
                                    {/* Day Name */}
                                    <div className="p-4 font-medium bg-blue-700 text-center text-white justify-center items-center flex">
                                        {DAY_MAP[day]}
                                    </div>

                                    {/* Period Cells */}
                                    {PERIODS.map((period) => {
                                        const slots =
                                            scheduleMap.get(
                                                `${day}-${period}`
                                            ) || [];

                                        return (
                                            <div
                                                key={period}
                                                className="p-2 border-l border-gray-300 min-h-[120px]"
                                            >
                                                {slots.length ? (
                                                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                                                        {slots.map(
                                                            (slot, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-blue-50 border border-blue-600 rounded-lg p-2 text-center"
                                                                >
                                                                    <div className="text-sm font-semibold text-blue-900">
                                                                        {slot.subject ??
                                                                            "No Subject"}
                                                                    </div>
                                                                    <div className="text-xs text-blue-600 inline-block px-2 py-0.5 mt-1">
                                                                        {
                                                                            slot.className
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-green-700 border-green-500 border rounded-lg bg-green-50  text-xs">
                                                        Free
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
