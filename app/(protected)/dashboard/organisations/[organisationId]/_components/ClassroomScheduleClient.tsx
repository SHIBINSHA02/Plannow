"use client";

import { useRouter } from "next/navigation";
import ClassroomScheduleTable from "./ClassroomScheduleTable";
import ScheduleStatusGrid from "./ScheduleStatusGrid";
import { ScheduleGridProvider } from "../../../../dashboard/context/ScheduleGridContext";
import { Assignment } from "../../../../dashboard/_types/schedule";
import EditClassOnboarding from "../classrooms/_components/EditClassOnboarding";

type Props = {
    organisationId: string;
    classroomId: string;
    className: string;
    initialGrid: Assignment[][][];
    days: string[];
    periods: string[];
    currentClassroom: any;
};

export default function ClassroomScheduleClient({
    organisationId,
    classroomId,
    className,
    initialGrid,
    days,
    periods,
    currentClassroom,
}: Props) {
    const router = useRouter();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() =>
                    router.push(`/dashboard/organisations/${organisationId}`)
                }
                className="text-sm text-blue-600 underline mb-4"
            >
                ← Back to classrooms
            </button>

            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                Classroom Schedule – <span className="text-blue-600">{className}</span>
            </h1>

            <ScheduleGridProvider
                initialGrid={initialGrid}
                days={days}
                periods={periods}
                subjectsConfig={currentClassroom?.subjects || []}
            >
                <ScheduleStatusGrid />
                <ClassroomScheduleTable />

                {/* Editor for Classroom Details moved inside provider */}
                <div className="mt-8 px-0 pb-20">
                    <EditClassOnboarding
                        organisationId={organisationId}
                        classroomId={classroomId}
                        currentClassroom={currentClassroom}
                    />
                </div>
            </ScheduleGridProvider>
        </div>
    );
}
