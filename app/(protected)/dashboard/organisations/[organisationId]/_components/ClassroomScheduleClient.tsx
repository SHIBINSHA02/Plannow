// app/(protected)/dashboard/organisations/[organisationId]/_components/ClassroomScheduleClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ClassroomScheduleTable from "./ClassroomScheduleTable";
import ScheduleStatusGrid from "./ScheduleStatusGrid";
import {
    ScheduleGridProvider,
    useScheduleGrid,
} from "../../../../dashboard/context/ScheduleGridContext";
import { Assignment } from "../../../../dashboard/_types/schedule";
import { Edit, Loader2, Sparkles } from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import AlertModal from "@/app/(protected)/_component/alert/AlertModel";
import { AlertConfig } from "@/types/alert";

type Props = {
    organisationId: string;
    classroomId: string;
    className: string;
    initialGrid: Assignment[][][];
    days: string[];
    periods: string[];
    currentClassroom: any;
};

function ClassroomScheduleActions({
    organisationId,
    classroomId,
}: {
    organisationId: string;
    classroomId: string;
}) {
    const router = useRouter();
    const { theme } = useTheme();
    const { reloadSchedule } = useScheduleGrid();

    const [isAutoScheduling, setIsAutoScheduling] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const handleAutoSchedule = () => {
        setAlertConfig({
            isOpen: true,
            title: "Confirm Auto Schedule",
            message:
                "Fill empty slots for this classroom based on remaining subject hours? Existing slots will not be changed.",
            type: "confirm_auto_assign",
        });
    };

    const executeAutoSchedule = async () => {
        setIsAutoScheduling(true);
        try {
            const res = await fetch(
                `/api/automate/${classroomId}?organisationId=${organisationId}`,
                { method: "POST" }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to auto-schedule");

            await reloadSchedule();

            setAlertConfig({
                isOpen: true,
                title: "Success",
                message: data.message || "Classroom schedule updated successfully.",
                type: "info",
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "An unexpected error occurred.";
            setAlertConfig({
                isOpen: true,
                title: "Error",
                message,
                type: "error",
            });
        } finally {
            setIsAutoScheduling(false);
        }
    };

    const handleAlertConfirm = () => {
        const wasConfirm = alertConfig.type === "confirm_auto_assign";

        setAlertConfig((prev) => ({
            ...prev,
            isOpen: false,
        }));

        if (wasConfirm) {
            executeAutoSchedule();
        }
    };

    return (
        <>
            <div className="mt-8 flex justify-end px-0 pb-20 gap-4">
                <button
                    onClick={() =>
                        router.push(
                            `/dashboard/organisations/${organisationId}/classrooms/${classroomId}/edit`
                        )
                    }
                    className={`p-3 rounded-xl border transition-all active:scale-95 shadow-sm
                        ${theme === "light"
                            ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                >
                    <Edit size={18} />
                </button>

                <button
                    onClick={handleAutoSchedule}
                    disabled={isAutoScheduling}
                    className={`flex items-center gap-2.5 px-5 py-3 text-white font-medium rounded-xl transition-all active:scale-[0.99] shadow-md shadow-blue-500/10 border disabled:opacity-60 disabled:cursor-not-allowed
                        ${theme === "light"
                            ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                            : "bg-blue-600 hover:bg-blue-700 border-blue-600"}`}
                >
                    {isAutoScheduling ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Sparkles size={18} />
                    )}
                    {isAutoScheduling ? "Scheduling…" : "Auto Schedule"}
                </button>
                <button
                    onClick={async () => {
                        try {
                            const res = await fetch(
                                `/api/classrooms/classroom/${classroomId}/clear`,
                                {
                                    method: "DELETE",
                                }
                            );

                            const data = await res.json();

                            if (!res.ok) {
                                throw new Error(data.error || "Failed to clear schedule");
                            }

                            await reloadSchedule();

                            setAlertConfig({
                                isOpen: true,
                                title: "Success",
                                message: "Schedule cleared successfully.",
                                type: "info",
                            });
                        } catch (error: unknown) {
                            setAlertConfig({
                                isOpen: true,
                                title: "Error",
                                message:
                                    error instanceof Error
                                        ? error.message
                                        : "Something went wrong",
                                type: "error",
                            });
                        }
                    }}
                    className={`p-3 rounded-xl border transition-all active:scale-95 shadow-sm
                        ${theme === "light"
                            ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                >
                    Clear All Schedule
                </button>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={
                    alertConfig.type === "confirm_auto_assign" ? "Yes, Schedule" : "OK"
                }
                cancelText={
                    alertConfig.type === "confirm_auto_assign" ? "Cancel" : undefined
                }
                onConfirm={handleAlertConfirm}
                onClose={() =>
                    setAlertConfig((prev) => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
            />
        </>
    );
}

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

            <h1
                className={`text-2xl font-semibold mb-6 tracking-tight transition-colors
                ${theme === "light" ? "text-gray-800" : "text-slate-100"}`}
            >
                Classroom Schedule –{" "}
                <span className={theme === "light" ? "text-blue-600" : "text-blue-400"}>
                    {className}
                </span>
            </h1>

            <ScheduleGridProvider
                initialGrid={initialGrid}
                days={days}
                periods={periods}
                subjectsConfig={currentClassroom?.subjects || []}
            >
                <ScheduleStatusGrid />
                <ClassroomScheduleTable />
                <ClassroomScheduleActions
                    organisationId={organisationId}
                    classroomId={classroomId}
                />
            </ScheduleGridProvider>
        </div>
    );
}
