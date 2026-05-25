/** Penalties at or above this are avoided in the strict pass (fallback may still apply). */
export const STRICT_PENALTY_THRESHOLD = 1000;

export type TeacherDaySchedule = Record<string, Record<number, Set<number>>>;

/** Length of the consecutive teaching block if `period` were assigned. */
export function getConsecutiveBlockSize(
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
 * How bad a slot is for a teacher. Lower = better.
 * Prioritises gaps between classes so teachers get breaks.
 */
export function calculateTeacherPenalty(
    teacherSchedule: TeacherDaySchedule,
    teacherId: string,
    day: number,
    period: number
): number {
    const periods = teacherSchedule[teacherId]?.[day];
    if (!periods) return 0;

    let penalty = 0;
    const dailyCount = periods.size;
    const hasPrev = periods.has(period - 1);
    const hasNext = periods.has(period + 1);
    const blockSize = getConsecutiveBlockSize(periods, period);

    if (dailyCount >= 3) {
        penalty += STRICT_PENALTY_THRESHOLD;
    }

    if (hasPrev) penalty += 400;
    if (hasNext) penalty += 400;

    if (hasPrev && hasNext) {
        penalty += 500;
    }

    if (blockSize >= 2) {
        penalty += (blockSize - 1) * 300;
    }

    if (blockSize >= 3) {
        penalty += 600;
    }

    if (blockSize >= 4) {
        penalty += STRICT_PENALTY_THRESHOLD;
    }

    penalty += dailyCount * 5;

    return penalty;
}
