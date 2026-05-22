"use client";

import { useRouter } from "next/navigation";
import ClassroomScheduleTable from "./ClassroomScheduleTable";
import ScheduleStatusGrid from "./ScheduleStatusGrid";
import { ScheduleGridProvider } from "../../../../dashboard/context/ScheduleGridContext";
import { Assignment } from "../../../../dashboard/_types/schedule";
import { Edit, Sparkles } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

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
    const { theme } = useTheme();

    return (
        <div className="p-6 mx-auto">
            {/* Back Navigation Link */}
            <button
                onClick={() =>
                    router.push(`/dashboard/organisations/${organisationId}`)
                }
                className={`text-sm underline mb-4 transition-colors block
                    ${theme === "light"
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-blue-400 hover:text-blue-300"}`}
            >
                ← Back to classrooms
            </button>

            {/* Header Title Heading */}
            <h1 className={`text-2xl font-semibold mb-6 tracking-tight transition-colors
                ${theme === "light" ? "text-gray-800" : "text-slate-100"}`}
            >
                Classroom Schedule –{" "}
                <span className={theme === "light" ? "text-blue-600" : "text-blue-400"}>
                    {className}
                </span>
            </h1>

            {/* Grid State Layout Context */}
            <ScheduleGridProvider
                initialGrid={initialGrid}
                days={days}
                periods={periods}
                subjectsConfig={currentClassroom?.subjects || []}
            >
                <ScheduleStatusGrid />
                <ClassroomScheduleTable />

                {/* Bottom Main Action Button Footer */}
                <div className="mt-8 flex justify-end px-0 pb-20 gap-4">
                    {/* Edit Details Button Icon Toggle */}
                    <button
                        onClick={() =>
                            router.push(`/dashboard/organisations/${organisationId}/classrooms/${classroomId}/edit`)
                        }
                        className={`p-3 rounded-xl border transition-all active:scale-95 shadow-sm
                            ${theme === "light"
                                ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                    >
                        <Edit size={18} />
                    </button>

                    {/* Auto Schedule Magical Action Call */}
                    <button
                        className={`flex items-center gap-2.5 px-5 py-3 text-white font-medium rounded-xl transition-all active:scale-[0.99] shadow-md shadow-blue-500/10 border
                            ${theme === "light"
                                ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                                : "bg-blue-600 hover:bg-blue-700 border-blue-600"}`}
                    >
                        <Sparkles size={18} />
                        Auto Schedule
                    </button>
                </div>
            </ScheduleGridProvider>
        </div>
    );
}