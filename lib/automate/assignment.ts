// lib/automate/assignment.ts

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

/**
 * Calculates how bad a slot is for a teacher.
 * Lower score = better slot.
 */
function calculateTeacherPenalty(
    teacherSchedule: Record<string, Record<number, Set<number>>>,
    teacherId: string,
    day: number,
    period: number
): number {

    const periods = teacherSchedule[teacherId]?.[day];

    // Teacher has no classes that day
    if (!periods) return 0;

    let penalty = 0;

    const hasPrev = periods.has(period - 1);
    const hasNext = periods.has(period + 1);

    /**
     * Continuous period penalties
     */

    // Consecutive with previous
    if (hasPrev) penalty += 5;

    // Consecutive with next
    if (hasNext) penalty += 5;

    // Worst case:
    // existing classes on both sides
    // Example: assigning at period 3 when 2 and 4 already occupied
    if (hasPrev && hasNext) {
        penalty += 20;
    }

    /**
     * Daily workload balancing
     */
    penalty += periods.size * 2;

    return penalty;
}

export async function performAutoAssignment(
    organisationId: string,
    session: ClientSession
): Promise<AutoAssignResult> {

    /**
     * 1. Fetch Organisation
     */
    const org = await Organisation
        .findOne({ organisationId })
        .session(session);

    if (!org) {
        throw new Error("Organisation not found");
    }

    const workingDays = org.workingDays || 5;
    const periodsPerDay = org.periodsPerDay || 6;

    /**
     * 2. Fetch Classrooms & Teachers
     */
    const classrooms = await Classroom
        .find({ organisationId })
        .session(session);

    const teachers = await Teacher
        .find({ organisations: organisationId })
        .session(session);

    /**
     * 3. Tracking Structures
     */

    /**
     * teacherBusy[day][period] = Set(teacherIds)
     */
    const teacherBusy: Record<
        number,
        Record<number, Set<string>>
    > = {};

    /**
     * classroomOccupied[classroomId][day][period] = true
     */
    const classroomOccupied: Record<
        string,
        Record<number, Record<number, boolean>>
    > = {};

    /**
     * teacherSchedule[teacherId][day] = Set(periods)
     */
    const teacherSchedule: Record<
        string,
        Record<number, Set<number>>
    > = {};

    /**
     * 4. Load Existing Slots
     */
    const existingSlots = await ScheduleSlot
        .find({ organisationId })
        .session(session);

    for (const slot of existingSlots) {

        /**
         * Teacher busy tracking
         */
        if (!teacherBusy[slot.day]) {
            teacherBusy[slot.day] = {};
        }

        if (!teacherBusy[slot.day][slot.period]) {
            teacherBusy[slot.day][slot.period] = new Set();
        }

        if (slot.teacherId) {
            teacherBusy[slot.day][slot.period]
                .add(slot.teacherId);
        }

        /**
         * Classroom occupied tracking
         */
        if (!classroomOccupied[slot.classroomId]) {
            classroomOccupied[slot.classroomId] = {};
        }

        if (!classroomOccupied[slot.classroomId][slot.day]) {
            classroomOccupied[slot.classroomId][slot.day] = {};
        }

        classroomOccupied[slot.classroomId][slot.day][slot.period] = true;

        /**
         * Teacher schedule tracking
         */
        if (slot.teacherId) {

            if (!teacherSchedule[slot.teacherId]) {
                teacherSchedule[slot.teacherId] = {};
            }

            if (!teacherSchedule[slot.teacherId][slot.day]) {
                teacherSchedule[slot.teacherId][slot.day] = new Set();
            }

            teacherSchedule[slot.teacherId][slot.day]
                .add(slot.period);
        }
    }

    let assignedCount = 0;

    /**
     * 5. Assignment Algorithm
     *
     * Better ordering:
     * day -> period -> classroom -> subject
     *
     * This distributes slots more evenly globally.
     */
    for (let d = 1; d <= workingDays; d++) {

        for (let p = 1; p <= periodsPerDay; p++) {

            for (const classroom of classrooms) {

                const clsId = classroom.classroomId;
                const subjects = classroom.subjects || [];

                /**
                 * Skip if classroom already occupied
                 */
                if (classroomOccupied[clsId]?.[d]?.[p]) {
                    continue;
                }

                for (const sub of subjects) {

                    let hoursToAssign =
                        sub.currentWeeklyHoursLeft || 0;

                    if (hoursToAssign <= 0) {
                        continue;
                    }

                    /**
                     * Find qualified teachers
                     */
                    const qualifiedTeachers = teachers.filter(t =>
                        t.subjects.includes(sub.subject)
                    );

                    /**
                     * Priority teacher
                     */
                    const preferredTeacherId =
                        sub.defaultTeacherId;

                    let chosenTeacherId: string | null = null;
                    let bestScore = Infinity;

                    /**
                     * 1. Try preferred teacher first
                     */
                    if (preferredTeacherId) {

                        const isBusy =
                            !org.allowParallelAssignments &&
                            teacherBusy[d]?.[p]?.has(preferredTeacherId);

                        if (!isBusy) {

                            const penalty =
                                calculateTeacherPenalty(
                                    teacherSchedule,
                                    preferredTeacherId,
                                    d,
                                    p
                                );

                            bestScore = penalty;
                            chosenTeacherId = preferredTeacherId;
                        }
                    }

                    /**
                     * 2. Find best teacher by score
                     */
                    for (const teacher of qualifiedTeachers) {

                        const teacherId = teacher.teacherId;

                        /**
                         * Skip already selected preferred teacher
                         */
                        if (teacherId === preferredTeacherId) {
                            continue;
                        }

                        const isBusy =
                            !org.allowParallelAssignments &&
                            teacherBusy[d]?.[p]?.has(teacherId);

                        if (isBusy) {
                            continue;
                        }

                        const penalty =
                            calculateTeacherPenalty(
                                teacherSchedule,
                                teacherId,
                                d,
                                p
                            );

                        /**
                         * Lower penalty is better
                         */
                        if (penalty < bestScore) {
                            bestScore = penalty;
                            chosenTeacherId = teacherId;
                        }
                    }

                    /**
                     * No teacher found
                     */
                    if (!chosenTeacherId) {
                        continue;
                    }

                    /**
                     * Create schedule slot
                     */
                    await ScheduleSlot.create([{
                        organisationId,
                        classroomId: clsId,
                        teacherId: chosenTeacherId,
                        subject: sub.subject,
                        day: d,
                        period: p
                    }], { session });

                    /**
                     * Update workload
                     */
                    await incrementWorkload({
                        organisationId,
                        teacherId: chosenTeacherId,
                        day: d,
                        period: p,
                        session
                    });

                    /**
                     * Update subject hours
                     */
                    await updateSubjectHours({
                        organisationId,
                        classroomId: clsId,
                        subjectName: sub.subject,
                        delta: -1,
                        session
                    });

                    /**
                     * Mark teacher busy
                     */
                    if (!teacherBusy[d]) {
                        teacherBusy[d] = {};
                    }

                    if (!teacherBusy[d][p]) {
                        teacherBusy[d][p] = new Set();
                    }

                    teacherBusy[d][p]
                        .add(chosenTeacherId);

                    /**
                     * Mark classroom occupied
                     */
                    if (!classroomOccupied[clsId]) {
                        classroomOccupied[clsId] = {};
                    }

                    if (!classroomOccupied[clsId][d]) {
                        classroomOccupied[clsId][d] = {};
                    }

                    classroomOccupied[clsId][d][p] = true;

                    /**
                     * Update teacher schedule
                     */
                    if (!teacherSchedule[chosenTeacherId]) {
                        teacherSchedule[chosenTeacherId] = {};
                    }

                    if (!teacherSchedule[chosenTeacherId][d]) {
                        teacherSchedule[chosenTeacherId][d] = new Set();
                    }

                    teacherSchedule[chosenTeacherId][d]
                        .add(p);

                    /**
                     * Reduce hours
                     */
                    sub.currentWeeklyHoursLeft--;

                    assignedCount++;

                    /**
                     * Important:
                     * Only one subject per classroom per slot
                     */
                    break;
                }
            }
        }
    }

    return {
        success: true,
        assignedCount,
        message: `Successfully assigned ${assignedCount} slots across organisation.`
    };
}