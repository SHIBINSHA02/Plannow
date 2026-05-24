// app/(protected)/dashboard/organisations/[organisationId]/classrooms/[classroomId]/schedule/page.tsx
import ClassroomScheduleClient from "./../../../_components/ClassroomScheduleClient";
import { Assignment } from "@/app/(protected)/dashboard/_types/schedule";
import { headers } from "next/headers";

/* ---------- Constants ---------- */

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["P1", "P2", "P3", "P4", "P5", "P6"];

/* ---------- Helpers ---------- */

const createEmptyGrid = (): Assignment[][][] =>
    days.map(() => periods.map(() => []));

const scheduleToGrid = (schedule: any[]) => {
    const grid = createEmptyGrid();

    schedule.forEach((slot) => {
        const d = slot.day - 1;
        const p = slot.period - 1;

        if (grid[d]?.[p]) {
            grid[d][p].push({
                _id: slot._id,
                teacherId: slot.teacherId,
                subject: slot.subject,
            });
        }
    });

    return grid;
};

/* ---------- Page ---------- */

export default async function Page({
    params,
}: {
    params: Promise<{
        organisationId: string;
        classroomId: string;
    }>;
}) {

    const { organisationId, classroomId } = await params;

    // ✅ Allow loading.tsx to render first
    if (!organisationId || !classroomId) {
        return null;
    }

    const hdrs = await headers();
    const host = hdrs.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const classroomRes = await fetch(
        `${baseUrl}/api/classrooms?organisationId=${organisationId}`,
        { cache: "no-store" }
    );

    const scheduleRes = await fetch(
        `${baseUrl}/api/schedule/classroom/${classroomId}?organisationId=${organisationId}`,
        { cache: "no-store" }
    );

    if (!classroomRes.ok || !scheduleRes.ok) {
        throw new Error("Failed to load classroom schedule");
    }

    const classrooms = await classroomRes.json();
    const schedule = await scheduleRes.json();

    const current = classrooms.find(
        (c: any) => c.classroomId === classroomId
    );

    return (
        <>
            <ClassroomScheduleClient
                organisationId={organisationId}
                classroomId={classroomId}
                className={current?.className ?? classroomId}
                initialGrid={scheduleToGrid(schedule)}
                days={days}
                periods={periods}
                currentClassroom={current}
            />
        </>
    );
}
