import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Classroom from "@/models/Classroom";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            organisationId,
            classroomId,
            className,
            department,
            subjects
        } = body;

        if (!organisationId || !classroomId || !className) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const classroom = await Classroom.create({
            organisationId,
            classroomId,
            className,
            department,
            subjects
        });

        return NextResponse.json(classroom, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const organisationId = searchParams.get("organisationId");

        if (!organisationId) {
            return NextResponse.json(
                { message: "organisationId required" },
                { status: 400 }
            );
        }

        const classrooms = await Classroom.find({ organisationId }).lean();

        return NextResponse.json(classrooms);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
