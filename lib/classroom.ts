import Classroom from "@/models/Classroom";
import { ClientSession } from "mongoose";

interface UpdateSubjectHoursArgs {
    organisationId: string;
    classroomId: string;
    subjectName: string;
    delta: number; // -1 for adding a slot, +1 for removing a slot
    session?: ClientSession;
}

export async function updateSubjectHours({
    organisationId,
    classroomId,
    subjectName,
    delta,
    session
}: UpdateSubjectHoursArgs) {
    if (!subjectName) return;

    await Classroom.updateOne(
        {
            organisationId,
            classroomId,
            "subjects.subject": subjectName
        },
        {
            $inc: { "subjects.$.currentWeeklyHoursLeft": delta }
        },
        { session }
    );
}
