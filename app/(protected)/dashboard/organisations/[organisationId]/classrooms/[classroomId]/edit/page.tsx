import EditClassOnboarding from "../../_components/EditClassOnboarding";
import { headers } from "next/headers";
import { ScheduleGridProvider } from "../../../../../context/ScheduleGridContext";

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

    if (!currentClassroom) return <div className="p-6">Classroom not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                Edit Classroom – <span className="text-blue-600">{currentClassroom.className}</span>
            </h1>
            <ScheduleGridProvider
                initialGrid={[]}
                days={[]}
                periods={[]}
                subjectsConfig={currentClassroom?.subjects || []}
            >
                <EditClassOnboarding
                    organisationId={organisationId}
                    classroomId={classroomId}
                    currentClassroom={currentClassroom}
                />
            </ScheduleGridProvider>
        </div>
    );
}
