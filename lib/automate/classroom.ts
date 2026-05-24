// lib/automate/classroom.ts
import { ClientSession } from "mongoose";
import Organisation from "@/models/Organisation";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import TeacherWorkload from "@/models/TeacherWorkload";
import { incrementWorkload } from "@/lib/workload";
import { updateSubjectHours } from "@/lib/classroom";

export interface ClassroomAutoAssignResult {
    success: boolean;
    assignedCount: number;
    message: string;
}

type ClassroomSubject = {
    subject: string;
    defaultTeacherId?: string;
    currentWeeklyHoursLeft?: number;
};

function sortTeachersByWorkload(
    teacherIds: string[],
    workloadByTeacher: Map<string, number>
) {
    return [...teacherIds].sort((a, b) => {
        const loadA = workloadByTeacher.get(a) ?? 0;
        const loadB = workloadByTeacher.get(b) ?? 0;
        if (loadA !== loadB) return loadA - loadB;
        return a.localeCompare(b);
    });
}

/** Remove teachers already assigned to another slot at this day/period. */
function excludeBusyTeachers(
    sortedIds: string[],
    busyAtSlot: Set<string> | undefined
): string[] {
    if (!busyAtSlot?.size) return sortedIds;
    return sortedIds.filter((id) => !busyAtSlot.has(id));
}

function pickTeacherForSlot(
    availableSortedIds: string[],
    previousTeacherId: string | undefined
): string | null {
    if (availableSortedIds.length === 0) return null;

    const preferred = previousTeacherId
        ? availableSortedIds.filter((id) => id !== previousTeacherId)
        : availableSortedIds;

    if (preferred.length > 0) return preferred[0];

    // No other teacher left — allow same teacher as previous period
    return availableSortedIds[0];
}

/**
 * Auto-fill schedule slots for a single classroom.
 * - Scans day 1..N and period 1..M for empty classroom slots
 * - Picks teachers with lowest TeacherWorkload at that day/period (tie-break: teacherId)
 * - Excludes teachers already assigned elsewhere at the same day/period
 * - Prefers a different teacher than the previous period in this classroom
 * - Falls back to the same teacher when no other qualified teacher is available
 */
export async function performClassroomAutoAssignment(
    organisationId: string,
    classroomId: string,
    session: ClientSession
): Promise<ClassroomAutoAssignResult> {
    const org = await Organisation.findOne({ organisationId }).session(session);
    if (!org) {
        throw new Error("Organisation not found");
    }

    const classroom = await Classroom.findOne({ organisationId, classroomId }).session(session);
    if (!classroom) {
        throw new Error("Classroom not found");
    }

    const workingDays = org.workingDays || 5;
    const periodsPerDay = org.periodsPerDay || 6;
    const subjects: ClassroomSubject[] = classroom.subjects || [];

    const teachers = await Teacher.find({ organisations: organisationId }).session(session);

    const teacherBusy: Record<number, Record<number, Set<string>>> = {};
    const classroomOccupied: Record<number, Record<number, boolean>> = {};
    const classroomTeacherAtSlot: Record<number, Record<number, string>> = {};

    const existingSlots = await ScheduleSlot.find({ organisationId }).session(session);
    for (const slot of existingSlots) {
        if (slot.teacherId) {
            if (!teacherBusy[slot.day]) teacherBusy[slot.day] = {};
            if (!teacherBusy[slot.day][slot.period]) teacherBusy[slot.day][slot.period] = new Set();
            teacherBusy[slot.day][slot.period].add(slot.teacherId);
        }

        if (slot.classroomId === classroomId) {
            if (!classroomOccupied[slot.day]) classroomOccupied[slot.day] = {};
            classroomOccupied[slot.day][slot.period] = true;

            if (slot.teacherId) {
                if (!classroomTeacherAtSlot[slot.day]) classroomTeacherAtSlot[slot.day] = {};
                classroomTeacherAtSlot[slot.day][slot.period] = slot.teacherId;
            }
        }
    }

    let assignedCount = 0;

    for (let day = 1; day <= workingDays; day++) {
        for (let period = 1; period <= periodsPerDay; period++) {
            if (classroomOccupied[day]?.[period]) continue;

            const subjectsNeedingHours = subjects
                .filter((s) => (s.currentWeeklyHoursLeft ?? 0) > 0)
                .sort(
                    (a, b) =>
                        (b.currentWeeklyHoursLeft ?? 0) - (a.currentWeeklyHoursLeft ?? 0)
                );

            if (subjectsNeedingHours.length === 0) continue;

            const workloadRows = await TeacherWorkload.find({
                organisationId,
                day,
                period,
            })
                .select("teacherId workload")
                .session(session)
                .lean();

            const workloadByTeacher = new Map(
                workloadRows.map((row) => [row.teacherId, row.workload ?? 0])
            );

            const previousTeacherId =
                period > 1 ? classroomTeacherAtSlot[day]?.[period - 1] : undefined;

            let assigned = false;

            for (const sub of subjectsNeedingHours) {
                const candidateIds = teachers
                    .filter((t) => t.subjects.includes(sub.subject))
                    .map((t) => t.teacherId);

                const sortedIds = sortTeachersByWorkload(candidateIds, workloadByTeacher);
                const availableSortedIds = excludeBusyTeachers(
                    sortedIds,
                    teacherBusy[day]?.[period]
                );

                const teacherId = pickTeacherForSlot(
                    availableSortedIds,
                    previousTeacherId
                );

                if (teacherId) {
                    await ScheduleSlot.create(
                        [
                            {
                                organisationId,
                                classroomId,
                                teacherId,
                                subject: sub.subject,
                                day,
                                period,
                            },
                        ],
                        { session }
                    );

                    await incrementWorkload({
                        organisationId,
                        teacherId,
                        day,
                        period,
                        session,
                    });

                    await updateSubjectHours({
                        organisationId,
                        classroomId,
                        subjectName: sub.subject,
                        delta: -1,
                        session,
                    });

                    if (!teacherBusy[day]) teacherBusy[day] = {};
                    if (!teacherBusy[day][period]) teacherBusy[day][period] = new Set();
                    teacherBusy[day][period].add(teacherId);

                    if (!classroomOccupied[day]) classroomOccupied[day] = {};
                    classroomOccupied[day][period] = true;

                    if (!classroomTeacherAtSlot[day]) classroomTeacherAtSlot[day] = {};
                    classroomTeacherAtSlot[day][period] = teacherId;

                    sub.currentWeeklyHoursLeft = (sub.currentWeeklyHoursLeft ?? 0) - 1;
                    assignedCount++;
                    assigned = true;
                }

                if (assigned) break;
            }
        }
    }

    return {
        success: true,
        assignedCount,
        message: `Successfully assigned ${assignedCount} slot(s) for classroom ${classroomId}.`,
    };
}
