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

            const subjectsNeedingHours = subjects
                .filter((s) => {
                    const hoursLeft =
                        hoursLeftBySubject.get(s.subject) ?? 0;

                    if (hoursLeft <= 0) return false;

                    const hasAvailableTeacher = teachers.some(
                        (t) =>
                            teacherTeachesSubject(
                                t.subjects,
                                s.subject
                            )
                    );
                    return hasAvailableTeacher;
                })
                .sort(
                    (a, b) =>
                        (hoursLeftBySubject.get(b.subject) ?? 0) -
                        (hoursLeftBySubject.get(a.subject) ?? 0)
                );

            if (subjectsNeedingHours.length === 0) {
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

            for (const sub of subjectsNeedingHours) {
                const candidateIds = teachers
                    .filter(
                        (t) =>
                            teacherTeachesSubject(
                                t.subjects,
                                sub.subject
                            ) &&
                            t.teacherId !== previousTeacherId
                    )
                    .map((t) => t.teacherId);;

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