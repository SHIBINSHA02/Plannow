"use client";

import { useRouter } from "next/navigation";
import ClassroomScheduleTable from "./ClassroomScheduleTable";
import ScheduleStatusGrid from "./ScheduleStatusGrid";
import { ScheduleGridProvider } from "../../../../dashboard/context/ScheduleGridContext";
import { Assignment } from "../../../../dashboard/_types/schedule";
import {Edit, Edit3, Sparkle, Sparkles } from "lucide-react";


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
        <div className="p-6  mx-auto">
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

                {/* Editor for Classroom Details moved to separate page */}
                <div className="mt-8 flex justify-end px-0 pb-20 gap-6">
                    <button
                        onClick={() => router.push(`/dashboard/organisations/${organisationId}/classrooms/${classroomId}/edit`)}
                        className="text-gray-400 p-3 rounded-full hover:bg-gray-100 transition bg-white border border-gray-200"
                    >
                        <Edit/>
                    </button>
                    <button className="text-white flex  gap-3 p-3 bg-blue-700 rounded-xl hover:bg-blue-700/90 transition  border border-gray-200   ">
                        <Sparkles/>
                        Auto Schedule
                    </button>
                    
                </div>
            </ScheduleGridProvider>
        </div>
    );
}
