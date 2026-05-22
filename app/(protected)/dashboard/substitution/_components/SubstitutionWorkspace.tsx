"use client";

import { useEffect, useState } from "react";
import { Classroom } from "@/types/classroom";
import { useTheme } from "@/app/theme-provider";
import SubstitutionScheduleGrid from "./SubstitutionScheduleGrid";
import RequestList from "./RequestList";
import ClericalRequestList from "./ClericalRequestList";
import SlotAssignModal from "./SlotAssignModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["P1", "P2", "P3", "P4", "P5", "P6"];

export type SlotInfo = {
    slotId: string;
    classroomId: string;
    className: string;
    day: number;
    period: number;
    subject?: string;
    teacherId?: string;
};

type ClericalEntry = {
    teacherId: string;
    organisationId: string;
    organisationName: string;
};

type Props = {
    organisationId: string;
};

export default function SubstitutionWorkspace({ organisationId }: Props) {
    const { theme } = useTheme();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [clericalEntry, setClericalEntry] = useState<ClericalEntry | null>(null);
    const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [assignSlot, setAssignSlot] = useState<SlotInfo | null>(null);

    /* ---------- Data Fetching ---------- */

    const fetchClassrooms = () => {
        fetch(`/api/classrooms?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setClassrooms)
            .catch(console.error);
    };

    const fetchOutgoing = () => {
        fetch(`/api/substitution?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setOutgoingRequests)
            .catch(console.error);
    };

    const fetchIncoming = (teacherId?: string) => {
        const tid = teacherId ?? clericalEntry?.teacherId;
        if (!tid) return;
        fetch(`/api/substitution/incoming?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setIncomingRequests)
            .catch(() => { });
    };

    useEffect(() => {
        fetchClassrooms();
        fetchOutgoing();
    }, [organisationId]);

    useEffect(() => {
        if (!selectedClassroomId) {
            setSchedule([]);
            return;
        }
        setLoading(true);
        fetch(`/api/schedule/classroom/${selectedClassroomId}?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setSchedule)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [organisationId, selectedClassroomId]);

    useEffect(() => {
        fetch(`/api/teachers?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then((list: { teacherId: string; teacherName: string }[]) => {
                const map: Record<string, string> = {};
                for (const t of list) map[t.teacherId] = t.teacherName;
                setTeachersMap(map);
            })
            .catch(() => { });
    }, [organisationId]);

    useEffect(() => {
        fetch("/api/profile/clerical")
            .then((r) => r.json())
            .then((data: { clerical: { teacherIds: ClericalEntry[] } | null }) => {
                if (!data.clerical) return;
                const entry = data.clerical.teacherIds.find((t) => t.organisationId === organisationId);
                if (entry) {
                    setClericalEntry(entry);
                    fetchIncoming(entry.teacherId);
                }
            })
            .catch(() => { });
    }, [organisationId]);

    const currentClassroom = classrooms.find((c) => c.classroomId === selectedClassroomId);

    return (
        <div className="flex gap-6 flex-col lg:flex-row">
            {/* ---- Left: Schedule Grid ---- */}
            <div className="flex-1 min-w-0">
                <div className={`rounded-2xl border p-6 shadow-sm mb-6 transition-colors duration-200 ${theme === "light" ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"
                    }`}>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${theme === "light" ? "text-slate-600" : "text-slate-400"
                        }`}>
                        Select Classroom
                    </label>
                    <select
                        value={selectedClassroomId ?? ""}
                        onChange={(e) => setSelectedClassroomId(e.target.value || null)}
                        className={`w-full max-w-xs px-4 py-2 border rounded-xl focus:ring-2 outline-none transition-colors duration-200 ${theme === "light"
                                ? "bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
                                : "bg-[#1e293b] border-slate-700 text-white focus:ring-blue-500"
                            }`}
                    >
                        <option value="">Choose classroom</option>
                        {classrooms.map((c) => (
                            <option key={c.classroomId} value={c.classroomId}>
                                {c.className} {c.department ? ` (${c.department})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedClassroomId && (
                    <SubstitutionScheduleGrid
                        schedule={schedule}
                        days={DAYS}
                        periods={PERIODS}
                        className={currentClassroom?.className ?? ""}
                        classroomId={selectedClassroomId}
                        onSlotClick={(slot) => setAssignSlot(slot)}
                        loading={loading}
                        teachersMap={teachersMap}
                    />
                )}
            </div>

            {/* ---- Right: Request Panels ---- */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
                {clericalEntry && (
                    <ClericalRequestList
                        requests={incomingRequests}
                        onRefresh={() => fetchIncoming()}
                        teachersMap={teachersMap}
                    />
                )}

                <RequestList
                    requests={outgoingRequests}
                    organisationId={organisationId}
                    onRefresh={fetchOutgoing}
                    teachersMap={teachersMap}
                />
            </aside>

            {/* ---- Modal ---- */}
            {assignSlot && (
                <SlotAssignModal
                    slot={assignSlot}
                    organisationId={organisationId}
                    onClose={() => setAssignSlot(null)}
                    onCreated={fetchOutgoing}
                    teachersMap={teachersMap}
                />
            )}
        </div>
    );
}