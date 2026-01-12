import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";

/**
 * UPDATE TEACHER
 */
export async function PUT(
    req: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        await connectDB();

        const updates = await req.json();

        const teacher = await Teacher.findOneAndUpdate(
            { teacherId: params.teacherId },
            updates,
            { new: true }
        );

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(teacher);

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE TEACHER
 */
export async function DELETE(
    req: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        await connectDB();

        const teacher = await Teacher.findOneAndDelete({
            teacherId: params.teacherId
        });

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
