"use server";

import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import { revalidatePath } from "next/cache";

export async function updateTeacherAction(organisationId: string, oldTeacherId: string, data: any) {
    try {
        await connectDB();

        let subjectsArray = data.subjects;
        if (typeof data.subjects === "string") {
            subjectsArray = data.subjects.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        const updated = await Teacher.findOneAndUpdate(
            { teacherId: oldTeacherId, organisations: organisationId },
            {
                $set: {
                    teacherName: data.teacherName,
                    email: data.email,
                    teacherId: data.teacherId,
                    subjects: subjectsArray,
                }
            },
            { new: true }
        );

        if (!updated) {
            return { success: false, error: "Teacher not found" };
        }

        revalidatePath(`/dashboard/organisations/${organisationId}/teachers/${data.teacherId}/profile`);
        revalidatePath(`/dashboard/organisations/${organisationId}/teachers`);

        return { success: true, newTeacherId: updated.teacherId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
