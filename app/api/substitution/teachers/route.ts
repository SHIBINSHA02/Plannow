import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";

/**
 * GET teachers for substitution, sorted by department priority.
 * /api/substitution/teachers?organisationId=X&classroomId=Y
 * Returns: same-department teachers first, then remaining org teachers.
 */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");
        const classroomId = searchParams.get("classroomId");

        if (!organisationId) {
            return NextResponse.json(
                { error: "organisationId is required" },
                { status: 400 }
            );
        }

        let targetDepartment: string | null = null;
        if (classroomId) {
            const classroom = await Classroom.findOne({
                organisationId,
                classroomId,
            })
                .select("department")
                .lean();
            targetDepartment = classroom?.department ?? null;
        }

        const allTeachers = await Teacher.find({
            organisations: organisationId,
        })
            .select("teacherId teacherName subjects")
            .lean();

        if (allTeachers.length === 0) {
            return NextResponse.json({ inDepartment: [], others: [] });
        }

        if (!targetDepartment) {
            return NextResponse.json({
                inDepartment: [],
                others: allTeachers,
            });
        }

        const teacherIdsInDept = new Set<string>();
        const classroomsWithDept = await Classroom.find({
            organisationId,
            department: targetDepartment,
        })
            .select("subjects")
            .lean();

        for (const cls of classroomsWithDept) {
            for (const s of cls.subjects || []) {
                if (s.defaultTeacherId) {
                    teacherIdsInDept.add(s.defaultTeacherId);
                }
            }
        }

        const inDept: typeof allTeachers = [];
        const notInDept: typeof allTeachers = [];

        for (const t of allTeachers) {
            if (teacherIdsInDept.has(t.teacherId)) {
                inDept.push(t);
            } else {
                notInDept.push(t);
            }
        }

        return NextResponse.json({
            inDepartment: inDept,
            others: notInDept,
        });
    } catch (error: any) {
        console.error("GET /api/substitution/teachers error:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch teachers" },
            { status: 500 }
        );
    }
}
