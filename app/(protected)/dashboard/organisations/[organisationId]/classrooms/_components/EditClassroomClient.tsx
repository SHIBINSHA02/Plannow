"use client";

import { useTheme } from "@/app/theme-provider";
import { ScheduleGridProvider } from "../../../../context/ScheduleGridContext";
import EditClassOnboarding from "./EditClassOnboarding";

type Props = {
    organisationId: string;
    classroomId: string;
    currentClassroom: any;
};

export default function EditClassroomClient({
    organisationId,
    classroomId,
    currentClassroom,
}: Props) {
    const { theme } = useTheme();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className={`text-2xl font-semibold mb-6 transition-colors duration-200
                ${theme === "light" ? "text-gray-800" : "text-slate-100"}`}
            >
                Edit Classroom –{" "}
                <span className={theme === "light" ? "text-blue-600" : "text-blue-400"}>
                    {currentClassroom.className}
                </span>
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
                    adminEmail={currentClassroom.adminEmail}
                />
            </ScheduleGridProvider>
        </div>
    );
}
