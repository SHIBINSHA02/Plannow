import EditClassroomClient from "../../_components/EditClassroomClient";
import { headers } from "next/headers";

export default async function Page({
    params,
}: {
    params: Promise<{
        organisationId: string;
        classroomId: string;
    }>;
}) {
    const { organisationId, classroomId } = await params;

    if (!organisationId || !classroomId) return null;

    const hdrs = await headers();
    const host = hdrs.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const classroomRes = await fetch(
        `${baseUrl}/api/classrooms?organisationId=${organisationId}`,
        { cache: "no-store" }
    );

    if (!classroomRes.ok) throw new Error("Failed to load classroom");

    const classrooms = await classroomRes.json();
    const currentClassroom = classrooms.find((c: any) => c.classroomId === classroomId);

    if (!currentClassroom) {
        return (
            <div className="p-6 text-gray-500 dark:text-slate-400">
                Classroom not found
            </div>
        );
    }

    return (
        <EditClassroomClient
            organisationId={organisationId}
            classroomId={classroomId}
            currentClassroom={currentClassroom}
        />
    );
}
