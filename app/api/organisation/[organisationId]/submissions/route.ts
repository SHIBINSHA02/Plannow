import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import OnboardingSubmission from "@/models/OnboardingSubmission";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function getUserEmail(user: any): string | null {
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

// Ensure Admin/Editor
async function checkAuth(organisationId: string) {
    const clerkUser = await currentUser();
    if (!clerkUser) return false;
    const email = getUserEmail(clerkUser);
    if (!email) return false;

    await connectDB();
    const org = await Organisation.findOne({
        organisationId,
        $or: [{ adminName: email }, { editors: email }],
    });
    return !!org;
}

// GET pending submissions
export async function GET(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    try {
        const { organisationId } = await context.params;
        const isAuth = await checkAuth(organisationId);
        if (!isAuth) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const submissions = await OnboardingSubmission.find({ organisationId, status: "PENDING" }).sort({ createdAt: -1 });
        return NextResponse.json({ submissions });
    } catch (error) {
        console.error("GET submissions error:", error);
        return NextResponse.json({ message: "Failed to fetch submissions" }, { status: 500 });
    }
}

// PATCH to Approve/Reject
export async function PATCH(
    req: Request,
    context: { params: Promise<{ organisationId: string }> }
) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { organisationId } = await context.params;
        const isAuth = await checkAuth(organisationId);
        if (!isAuth) {
            await session.abortTransaction();
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { submissionId, action } = await req.json(); // action="APPROVE" or "REJECT"

        if (!submissionId || !["APPROVE", "REJECT"].includes(action)) {
            await session.abortTransaction();
            return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
        }

        const submission = await OnboardingSubmission.findOne({ _id: submissionId, organisationId, status: "PENDING" }).session(session);

        if (!submission) {
            await session.abortTransaction();
            return NextResponse.json({ message: "Submission not found or already processed" }, { status: 404 });
        }

        if (action === "REJECT") {
            submission.status = "REJECTED";
            await submission.save({ session });
            await session.commitTransaction();
            return NextResponse.json({ success: true, message: "Rejected successfully" });
        }

        if (action === "APPROVE") {
            const data = submission.data;

            if (submission.type === "TEACHER") {
                let teacher = await Teacher.findOne({ teacherId: data.teacherId }).session(session);
                if (teacher) {
                    if (!teacher.organisations.includes(organisationId)) {
                        teacher.organisations.push(organisationId);
                    }
                    // Update info from new submission
                    teacher.teacherName = data.teacherName;
                    teacher.email = data.email;
                    teacher.subjects = data.subjects || [];
                    await teacher.save({ session });
                } else {
                    await Teacher.create([{
                        teacherId: data.teacherId,
                        teacherName: data.teacherName,
                        email: data.email,
                        subjects: data.subjects || [],
                        organisations: [organisationId]
                    }], { session });
                }
            } else if (submission.type === "CLASSROOM") {
                // Check if classroom ID already exists in system
                const existing = await Classroom.findOne({ classroomId: data.classroomId }).session(session);
                if (existing) {
                    await session.abortTransaction();
                    return NextResponse.json({ message: "Classroom ID already exists" }, { status: 400 });
                }

                await Classroom.create([{
                    organisationId,
                    classroomId: data.classroomId,
                    className: data.className,
                    department: data.department || "",
                    adminEmail: data.adminEmail,
                    editorEmails: [],
                    subjects: []
                }], { session });
            }

            submission.status = "APPROVED";
            await submission.save({ session });
            await session.commitTransaction();

            return NextResponse.json({ success: true, message: "Approved successfully" });
        }

    } catch (error: any) {
        await session.abortTransaction();
        console.error("PATCH submission error:", error);
        return NextResponse.json({ message: "Failed to process submission" }, { status: 500 });
    } finally {
        session.endSession();
    }
}
