import TeacherWorkload from "@/models/TeacherWorkload";

const MAX_PERIOD = 8;

export function getAffectedPeriods(period: number) {
    return [period - 1, period, period + 1].filter(
        p => p >= 1 && p <= MAX_PERIOD
    );
}

export async function incrementWorkload({
    organisationId,
    teacherId,
    day,
    period,
    session
}: any) {
    const affected = getAffectedPeriods(period);

    for (const p of affected) {
        await TeacherWorkload.findOneAndUpdate(
            { organisationId, teacherId, day, period: p },
            { $inc: { workload: 1 } },
            { upsert: true, session }
        );
    }
}

export async function decrementWorkload({
    organisationId,
    teacherId,
    day,
    period,
    session
}: any) {
    const affected = getAffectedPeriods(period);

    for (const p of affected) {
        await TeacherWorkload.findOneAndUpdate(
            { organisationId, teacherId, day, period: p },
            { $inc: { workload: -1 } },
            { session }
        );
    }
}
