// lib/automate/classroom.ts
import { ClientSession } from "mongoose";
import Organisation from "@/models/Organisation";
import Teacher from "@/models/Teacher";
import Classroom from "@/models/Classroom";
import ScheduleSlot from "@/models/ScheduleSlot";
import TeacherWorkload from "@/models/TeacherWorkload";
import { incrementWorkload } from "@/lib/workload";
import { updateSubjectHours } from "@/lib/classroom";
import {
    calculateTeacherPenalty,
    STRICT_PENALTY_THRESHOLD,
    type TeacherDaySchedule,
} from "@/lib/automate/teacherPenalty";

export interface ClassroomAutoAssignResult {
    success: boolean;
    assignedCount: number;
    message: string;
}

type ClassroomSubject = {
    subject: string;
    weeklyHours?: number;
    defaultTeacherId?: string;
    currentWeeklyHoursLeft?: number;
};

function teacherTeachesSubject(
    teacherSubjects: string[],
    subjectName: string
): boolean {
    return teacherSubjects.some(
        (s) => s.toString() === subjectName.toString()
    );
}

function buildHoursLeftBySubject(
    subjects: ClassroomSubject[],
    assignedHoursBySubject: Map<string, number>
): Map<string, number> {
    const hoursLeft = new Map<string, number>();

    for (const sub of subjects) {
        const weekly = sub.weeklyHours ?? 0;
        const assigned = assignedHoursBySubject.get(sub.subject) ?? 0;
        hoursLeft.set(sub.subject, Math.max(0, weekly - assigned));
    }

    return hoursLeft;
}

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

type TeacherCandidateScore = {
    id: string;
    penalty: number;
    workload: number;
};

function getTeacherDayLoad(
    teacherSchedule: TeacherDaySchedule,
    teacherId: string,
    day: number
): number {
    return teacherSchedule[teacherId]?.[day]?.size ?? 0;
}

function wouldExceedTwoConsecutiveClasses(
    teacherSchedule: TeacherDaySchedule,
    teacherId: string,
    day: number,
    period: number
): boolean {
    const periods = teacherSchedule[teacherId]?.[day];
    if (!periods) return false;

    return (
        (periods.has(period - 2) && periods.has(period - 1)) ||
        (periods.has(period - 1) && periods.has(period + 1)) ||
        (periods.has(period + 1) && periods.has(period + 2))
    );
}

function hasConsecutiveSameClassroomTeacher(
    classroomTeacherAtSlot: Record<number, Record<number, string>>,
    teacherId: string,
    day: number,
    period: number
): boolean {
    return (
        classroomTeacherAtSlot[day]?.[period - 1] === teacherId ||
        classroomTeacherAtSlot[day]?.[period + 1] === teacherId
    );
}

function buildAvailableTeachersForSubject(
    subject: string,
    teachers: { teacherId: string; subjects: string[] }[],
    teacherSchedule: TeacherDaySchedule,
    classroomTeacherAtSlot: Record<number, Record<number, string>>,
    day: number,
    period: number
): string[] {
    return teachers
        .filter((teacher) => {
            if (
                !teacherTeachesSubject(
                    teacher.subjects,
                    subject
                )
            ) {
                return false;
            }

            const teacherId = teacher.teacherId;

            // Teacher already occupied at this slot
            if (
                teacherSchedule[teacherId]?.[day]?.has(
                    period
                )
            ) {
                return false;
            }

            // A teacher can take at most 2 consecutive classes.
            if (
                wouldExceedTwoConsecutiveClasses(
                    teacherSchedule,
                    teacherId,
                    day,
                    period
                )
            ) {
                return false;
            }

            // Same teacher should not be in same classroom in consecutive periods.
            if (
                hasConsecutiveSameClassroomTeacher(
                    classroomTeacherAtSlot,
                    teacherId,
                    day,
                    period
                )
            ) {
                return false;
            }

            return true;
        })
        .map((teacher) => teacher.teacherId);
}

function pickTeacherForSlot(
    availableSortedIds: string[],
    teacherSchedule: TeacherDaySchedule,
    day: number,
    period: number,
    previousTeacherId: string | undefined,
    workloadByTeacher: Map<string, number>
): string | null {
    if (availableSortedIds.length === 0) return null;

    const candidates: TeacherCandidateScore[] =
        availableSortedIds.map((id) => ({
            id,
            penalty: calculateTeacherPenalty(
                teacherSchedule,
                id,
                day,
                period
            ),
            workload: workloadByTeacher.get(id) ?? 0,
        }));

    const pickBest = (
        pool: TeacherCandidateScore[],
        filter: (c: TeacherCandidateScore) => boolean
    ): string | null => {
        let best: TeacherCandidateScore | null = null;

        for (const c of pool) {
            if (!filter(c)) continue;

            if (
                !best ||
                c.penalty < best.penalty ||
                (c.penalty === best.penalty &&
                    c.workload < best.workload)
            ) {
                best = c;
            }
        }

        return best?.id ?? null;
    };

    const strictPenalty = (c: TeacherCandidateScore) =>
        c.penalty < STRICT_PENALTY_THRESHOLD;

    
    return (
        pickBest(candidates, strictPenalty) ??
        pickBest(candidates, () => true)
    );
}

function buildZeroAssignmentMessage(
    subjects: ClassroomSubject[],
    hoursLeftBySubject: Map<string, number>,
    teachers: { subjects: string[] }[],
    workingDays: number,
    periodsPerDay: number,
    classroomOccupied: Record<number, Record<number, boolean>>
): string {
    const totalHoursLeft = [...hoursLeftBySubject.values()].reduce(
        (sum, h) => sum + h,
        0
    );

    if (totalHoursLeft <= 0) {
        return "No slots were filled: all subject weekly hours are already scheduled.";
    }

    const hasQualifiedTeacher = subjects.some(
        (sub) =>
            (hoursLeftBySubject.get(sub.subject) ?? 0) > 0 &&
            teachers.some((t) =>
                teacherTeachesSubject(
                    t.subjects,
                    sub.subject
                )
            )
    );

    if (!hasQualifiedTeacher) {
        return "No slots were filled: no teachers are assigned to the subjects that still need hours.";
    }

    let openCells = 0;

    for (let day = 1; day <= workingDays; day++) {
        for (
            let period = 1;
            period <= periodsPerDay;
            period++
        ) {
            if (!classroomOccupied[day]?.[period]) {
                openCells++;
            }
        }
    }

    if (openCells <= 0) {
        return "No slots were filled: every period in this classroom already has a schedule entry.";
    }

    return "No slots were filled: no available teacher could be placed in the open periods.";
}

/**
 * Auto-fill schedule slots for a single classroom.
 * - Scans day 1..N and period 1..M for empty classroom slots
 * - Uses teacher penalty scoring to encourage breaks
 * - Tie-breaks with lowest TeacherWorkload
 * - Prefers a different teacher than the previous classroom period
 * - Does not check parallel assignments
 */
export async function performClassroomAutoAssignment(
    organisationId: string,
    classroomId: string,
    session: ClientSession
): Promise<ClassroomAutoAssignResult> {
    const org = await Organisation.findOne({
        organisationId,
    }).session(session);

    if (!org) {
        throw new Error("Organisation not found");
    }

    const classroom = await Classroom.findOne({
        organisationId,
        classroomId,
    }).session(session);

    if (!classroom) {
        throw new Error("Classroom not found");
    }

    const workingDays = org.workingDays || 5;
    const periodsPerDay = org.periodsPerDay || 6;
    const minTeacherPeriodsPerDay =
        org.minTeacherPeriodsPerDay || 3;

    const subjects: ClassroomSubject[] =
        classroom.subjects || [];

    const teachers = await Teacher.find({
        organisations: organisationId,
    }).session(session);

    const teacherSchedule: TeacherDaySchedule = {};
    const classroomOccupied: Record<
        number,
        Record<number, boolean>
    > = {};

    const classroomTeacherAtSlot: Record<
        number,
        Record<number, string>
    > = {};

    const incompleteSlotIdByDayPeriod: Record<
        number,
        Record<number, string>
    > = {};

    const assignedHoursBySubject = new Map<
        string,
        number
    >();

    const existingSlots = await ScheduleSlot.find({
        organisationId,
    }).session(session);

    for (const slot of existingSlots) {
        if (slot.teacherId) {
            if (!teacherSchedule[slot.teacherId]) {
                teacherSchedule[slot.teacherId] = {};
            }

            if (!teacherSchedule[slot.teacherId][slot.day]) {
                teacherSchedule[slot.teacherId][slot.day] = new Set();
            }

            teacherSchedule[slot.teacherId][slot.day].add(
                slot.period
            );
        }

        if (slot.classroomId !== classroomId) continue;

        const isFilled = Boolean(
            slot.teacherId && slot.subject
        );

        if (isFilled) {
            if (!classroomOccupied[slot.day]) {
                classroomOccupied[slot.day] = {};
            }

            classroomOccupied[slot.day][slot.period] = true;

            assignedHoursBySubject.set(
                slot.subject!,
                (assignedHoursBySubject.get(slot.subject!) ??
                    0) + 1
            );

            if (!classroomTeacherAtSlot[slot.day]) {
                classroomTeacherAtSlot[slot.day] = {};
            }

            classroomTeacherAtSlot[slot.day][slot.period] =
                slot.teacherId!;
        } else if (slot._id) {
            if (!incompleteSlotIdByDayPeriod[slot.day]) {
                incompleteSlotIdByDayPeriod[slot.day] = {};
            }

            incompleteSlotIdByDayPeriod[slot.day][
                slot.period
            ] = slot._id.toString();
        }
    }

    const hoursLeftBySubject =
        buildHoursLeftBySubject(
            subjects,
            assignedHoursBySubject
        );

    let assignedCount = 0;

    for (let day = 1; day <= workingDays; day++) {
        for (
            let period = 1;
            period <= periodsPerDay;
            period++
        ) {
            if (classroomOccupied[day]?.[period]) {
                continue;
            }

            const workloadRows =
                await TeacherWorkload.find({
                    organisationId,
                    day,
                    period,
                })
                    .select("teacherId workload")
                    .session(session)
                    .lean();

            const workloadByTeacher = new Map(
                workloadRows.map((row) => [
                    row.teacherId,
                    row.workload ?? 0,
                ])
            );

            const previousTeacherId =
                period > 1
                    ? classroomTeacherAtSlot[day]?.[
                    period - 1
                    ]
                    : undefined;

            const subjectsNeedingHours = subjects
                .filter(
                    (s) =>
                        (hoursLeftBySubject.get(s.subject) ?? 0) > 0
                )
                .map((sub) => {
                    const candidateIds = buildAvailableTeachersForSubject(
                        sub.subject,
                        teachers,
                        teacherSchedule,
                        classroomTeacherAtSlot,
                        day,
                        period
                    ).filter(
                        (teacherId) =>
                            getTeacherDayLoad(
                                teacherSchedule,
                                teacherId,
                                day
                            ) < minTeacherPeriodsPerDay
                    );

                    if (candidateIds.length === 0) {
                        return null;
                    }

                    const leastWorkload = Math.min(
                        ...candidateIds.map(
                            (teacherId) =>
                                workloadByTeacher.get(
                                    teacherId
                                ) ?? 0
                        )
                    );

                    return {
                        sub,
                        candidateIds,
                        leastWorkload,
                        hoursLeft:
                            hoursLeftBySubject.get(
                                sub.subject
                            ) ?? 0,
                    };
                })
                .filter(
                    (
                        item
                    ): item is {
                        sub: ClassroomSubject;
                        candidateIds: string[];
                        leastWorkload: number;
                        hoursLeft: number;
                    } => Boolean(item)
                )
                .sort((a, b) => {
                    if (a.leastWorkload !== b.leastWorkload) {
                        return (
                            a.leastWorkload -
                            b.leastWorkload
                        );
                    }
                    return b.hoursLeft - a.hoursLeft;
                });

            if (subjectsNeedingHours.length === 0) {
                continue;
            }

            for (const subjectOption of subjectsNeedingHours) {
                const { sub } = subjectOption;
                const candidateIds =
                    subjectOption.candidateIds.filter(
                        (teacherId) =>
                            teacherId !== previousTeacherId
                    );

                if (candidateIds.length === 0) {
                    continue;
                }

                const sortedIds =
                    sortTeachersByWorkload(
                        candidateIds,
                        workloadByTeacher
                    );

                const teacherId =
                    pickTeacherForSlot(
                        sortedIds,
                        teacherSchedule,
                        day,
                        period,
                        previousTeacherId,
                        workloadByTeacher
                    );

                if (!teacherId) {
                    continue;
                }

                const incompleteSlotId =
                    incompleteSlotIdByDayPeriod[day]?.[
                    period
                    ];

                if (incompleteSlotId) {
                    await ScheduleSlot.findOneAndUpdate(
                        {
                            _id: incompleteSlotId,
                            organisationId,
                        },
                        {
                            teacherId,
                            subject: sub.subject,
                        },
                        { session }
                    );
                } else {
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
                }

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

                if (!classroomOccupied[day]) {
                    classroomOccupied[day] = {};
                }

                classroomOccupied[day][period] = true;

                if (!classroomTeacherAtSlot[day]) {
                    classroomTeacherAtSlot[day] = {};
                }

                classroomTeacherAtSlot[day][period] =
                    teacherId;

                if (!teacherSchedule[teacherId]) {
                    teacherSchedule[teacherId] = {};
                }

                if (
                    !teacherSchedule[teacherId][day]
                ) {
                    teacherSchedule[teacherId][day] =
                        new Set();
                }

                teacherSchedule[teacherId][day].add(
                    period
                );

                hoursLeftBySubject.set(
                    sub.subject,
                    (hoursLeftBySubject.get(
                        sub.subject
                    ) ?? 0) - 1
                );

                assignedCount++;

                // IMPORTANT:
                // only one subject per classroom slot
                break;
            }
        }
        
    }

    const message =
        assignedCount > 0
            ? `Successfully assigned ${assignedCount} slot(s) for classroom ${classroomId}.`
            : buildZeroAssignmentMessage(
                subjects,
                hoursLeftBySubject,
                teachers,
                workingDays,
                periodsPerDay,
                classroomOccupied
            );

    return {
        success: true,
        assignedCount,
        message,
    };
}


/**
 * Attempts to re-position existing schedule slots into earlier empty slots 
 * to consolidate the schedule.
 */
export async function optimizeClassroomSchedule(
    organisationId: string,
    classroomId: string,
    session: ClientSession
): Promise<{ movedCount: number }> {
    const slots = await ScheduleSlot.find({ organisationId, classroomId }).session(session);

    // Sort slots to prioritize moving later ones first
    const occupiedSlots = slots
        .filter(s => s.teacherId && s.subject)
        .sort((a, b) => (b.day * 100 + b.period) - (a.day * 100 + a.period));

    let movedCount = 0;

    for (const slot of occupiedSlots) {
        // Find an earlier empty slot
        const target = await findEarlierAvailableSlot(organisationId, classroomId, slot, session);

        if (target) {
            // Verify if teacher is free at the new time
            if (await isTeacherFree(slot.teacherId!, target.day, target.period, organisationId, session)) {
                slot.day = target.day;
                slot.period = target.period;
                await slot.save({ session });
                movedCount++;
            }
        }
    }

    return { movedCount };
}

async function findEarlierAvailableSlot(
    organisationId: string,
    classroomId: string,
    currentSlot: any,
    session: ClientSession
) {
    const allSlots = await ScheduleSlot.find({ organisationId, classroomId }).session(session);

  
    for (let day = 1; day <= currentSlot.day; day++) {
        for (let period = 1; period <= (day === currentSlot.day ? currentSlot.period - 1 : 6); period++) {
            const isTaken = allSlots.some(s => s.day === day && s.period === period);
            if (!isTaken) return { day, period };
        }
    }
    return null;
}

async function isTeacherFree(
    teacherId: string,
    day: number,
    period: number,
    organisationId: string,
    session: ClientSession
): Promise<boolean> {
    const conflict = await ScheduleSlot.findOne({
        organisationId,
        teacherId,
        day,
        period
    }).session(session);

    return !conflict;
}