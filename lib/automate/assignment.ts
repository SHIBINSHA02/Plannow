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

/** Penalties above this are avoided in the strict pass (fallback may still apply). */
const STRICT_PENALTY_THRESHOLD = 1000;

/** Length of the consecutive teaching block if `period` were assigned. */
function getConsecutiveBlockSize(
    periods: Set<number>,
    period: number
): number {
    let size = 1;
    let p = period - 1;
    while (periods.has(p)) {
        size++;
        p--;
    }
    p = period + 1;
    while (periods.has(p)) {
        size++;
        p++;
    }
    return size;
}

/**
 * Calculates how bad a slot is for a teacher.
 * Lower score = better slot.
 * Prioritises gaps between classes so teachers get breaks.
 */
function calculateTeacherPenalty(
    teacherSchedule: Record<string, Record<number, Set<number>>>,
    teacherId: string,
    day: number,
    period: number
): number {

    const periods = teacherSchedule[teacherId]?.[day];

    // No classes yet — ideal for a break-friendly day
    if (!periods) return 0;

    let penalty = 0;

    const dailyCount = periods.size;

    const hasPrev = periods.has(period - 1);
    const hasNext = periods.has(period + 1);
    const blockSize = getConsecutiveBlockSize(periods, period);

    /**
     * HARD PRIORITY:
     * More than 3 slots/day should be heavily penalized
     */
    if (dailyCount >= 3) {
        penalty += STRICT_PENALTY_THRESHOLD;
    }

    /**
     * Back-to-back periods — no break before/after this slot
     */
    if (hasPrev) penalty += 400;
    if (hasNext) penalty += 400;

    /**
     * Sandwiched between two classes — no break on either side
     */
    if (hasPrev && hasNext) {
        penalty += 500;
    }

    /**
     * Consecutive stretch: prefer isolated periods with gaps
     */
    if (blockSize >= 2) {
        penalty += (blockSize - 1) * 300;
    }

    /** Three or more periods in a row — no proper break in the stretch */
    if (blockSize >= 3) {
        penalty += 600;
    }

    /** Four+ consecutive — treat like a hard constraint in strict pass */
    if (blockSize >= 4) {
        penalty += STRICT_PENALTY_THRESHOLD;
    }

    /**
     * Balance workload slightly
     */
    penalty += dailyCount * 5;

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
                        t.subjects.some(
                            (                            s: { toString: () => any; }) => s.toString() === sub.subject.toString()
                        )
                    );
                    /**
                     * Priority teacher
                     */
                    const preferredTeacherId =
                        sub.defaultTeacherId;

                    let chosenTeacherId: string | null = null;
                    let bestScore = Infinity;

                    let fallbackTeacherId: string | null = null;
                    let fallbackScore = Infinity;

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

                            if (penalty < STRICT_PENALTY_THRESHOLD && penalty < bestScore) {
                                bestScore = penalty;
                                chosenTeacherId = preferredTeacherId;
                            }

                            if (penalty < fallbackScore) {
                                fallbackScore = penalty;
                                fallbackTeacherId = preferredTeacherId;
                            }
                            
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
                        if (penalty < STRICT_PENALTY_THRESHOLD && penalty < bestScore) {
                            bestScore = penalty;
                            chosenTeacherId = teacherId;
                        }

                        if (penalty < fallbackScore) {
                            fallbackScore = penalty;
                            fallbackTeacherId = teacherId;
                        }
                    }

                    /**
                     * No teacher found
                     */
                    // If strict constraints fail,
                
                    if (!chosenTeacherId) {
                        chosenTeacherId = fallbackTeacherId;
                    }

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