import mongoose, { ClientSession } from "mongoose";
import Organisation from "@/models/Organisation";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import { incrementWorkload } from "@/lib/workload";
import { updateSubjectHours } from "@/lib/classroom";

interface AutoAssignResult {
    success: boolean;
    assignedCount: number;
    message: string;
}

export async function performAutoAssignment(organisationId: string, session: ClientSession): Promise<AutoAssignResult> {
    // 1. Fetch Organisation details
    const org = await Organisation.findOne({ organisationId }).session(session);
    if (!org) {
        throw new Error("Organisation not found");
    }

    const workingDays = org.workingDays || 5;
    const periodsPerDay = org.periodsPerDay || 6;

    // 2. Fetch all Classrooms and Teachers
    const classrooms = await Classroom.find({ organisationId }).session(session);
    const teachers = await Teacher.find({ organisations: organisationId }).session(session);

    // 3. Keep track of busy teachers and occupied slots
    // teacherBusy[day][period] = Set of teacherIds
    const teacherBusy: Record<number, Record<number, Set<string>>> = {};
    // classroomOccupied[classroomId][day][period] = boolean
    const classroomOccupied: Record<string, Record<number, Record<number, boolean>>> = {};

    // Pre-fill existing slots
    const existingSlots = await ScheduleSlot.find({ organisationId }).session(session);
    existingSlots.forEach(slot => {
        if (!teacherBusy[slot.day]) teacherBusy[slot.day] = {};
        if (!teacherBusy[slot.day][slot.period]) teacherBusy[slot.day][slot.period] = new Set();
        if (slot.teacherId) teacherBusy[slot.day][slot.period].add(slot.teacherId);

        if (!classroomOccupied[slot.classroomId]) classroomOccupied[slot.classroomId] = {};
        if (!classroomOccupied[slot.classroomId][slot.day]) classroomOccupied[slot.classroomId][slot.day] = {};
        classroomOccupied[slot.classroomId][slot.day][slot.period] = true;
    });

    let assignedCount = 0;

    // 4. Algorithm: Greedy Assignment
    for (const classroom of classrooms) {
        const clsId = classroom.classroomId;
        const subjects = classroom.subjects || [];

        for (const sub of subjects) {
            let hoursToAssign = sub.currentWeeklyHoursLeft || 0;
            if (hoursToAssign <= 0) continue;

            // Try to find a teacher for this subject
            const preferredTeacherId = sub.defaultTeacherId;
            const qualifiedTeachers = teachers.filter(t => t.subjects.includes(sub.subject));

            // Iterate through slots to fill hours
            for (let d = 1; d <= workingDays; d++) {
                for (let p = 1; p <= periodsPerDay; p++) {
                    if (hoursToAssign <= 0) break;

                    // Check if classroom slot is occupied
                    if (classroomOccupied[clsId]?.[d]?.[p]) continue;

                    // Try to find an available teacher
                    let chosenTeacherId: string | null = null;

                    // Check preferred teacher first
                    if (preferredTeacherId) {
                        const isBusy = !org.allowParallelAssignments && teacherBusy[d]?.[p]?.has(preferredTeacherId);
                        if (!isBusy) {
                            chosenTeacherId = preferredTeacherId;
                        }
                    }

                    // If preferred is busy, try others
                    if (!chosenTeacherId) {
                        for (const t of qualifiedTeachers) {
                            const isBusy = !org.allowParallelAssignments && teacherBusy[d]?.[p]?.has(t.teacherId);
                            if (!isBusy) {
                                chosenTeacherId = t.teacherId;
                                break;
                            }
                        }
                    }

                    if (chosenTeacherId) {
                        // Assign!
                        await ScheduleSlot.create([{
                            organisationId,
                            classroomId: clsId,
                            teacherId: chosenTeacherId,
                            subject: sub.subject,
                            day: d,
                            period: p
                        }], { session });

                        // Update workload and subject hours
                        await incrementWorkload({
                            organisationId,
                            teacherId: chosenTeacherId,
                            day: d,
                            period: p,
                            session
                        });

                        await updateSubjectHours({
                            organisationId,
                            classroomId: clsId,
                            subjectName: sub.subject,
                            delta: -1,
                            session
                        });

                        // Mark as busy
                        if (!teacherBusy[d]) teacherBusy[d] = {};
                        if (!teacherBusy[d][p]) teacherBusy[d][p] = new Set();
                        teacherBusy[d][p].add(chosenTeacherId);

                        if (!classroomOccupied[clsId]) classroomOccupied[clsId] = {};
                        if (!classroomOccupied[clsId][d]) classroomOccupied[clsId][d] = {};
                        classroomOccupied[clsId][d][p] = true;

                        hoursToAssign--;
                        assignedCount++;
                    }
                }
                if (hoursToAssign <= 0) break;
            }
        }
    }

    return {
        success: true,
        assignedCount,
        message: `Successfully assigned ${assignedCount} slots across organisation.`
    };
}
