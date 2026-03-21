"use client";

import { useEffect, useState } from "react";
import { Classroom } from "@/types/classroom";
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
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] =
        useState<string | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);

    // Outgoing requests (created by this user)
    const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

    // Incoming requests (targeted at this user as a clerical)
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [clericalEntry, setClericalEntry] = useState<ClericalEntry | null>(null);

    const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [assignSlot, setAssignSlot] = useState<SlotInfo | null>(null);

    /* ---------- Classrooms ---------- */
    const fetchClassrooms = () => {
        fetch(`/api/classrooms?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setClassrooms)
            .catch(console.error);
    };

    useEffect(() => {
        fetchClassrooms();
    }, [organisationId]);

    /* ---------- Schedule for selected classroom ---------- */
    useEffect(() => {
        if (!selectedClassroomId) {
            setSchedule([]);
            return;
        }
        setLoading(true);
        fetch(
            `/api/schedule/classroom/${selectedClassroomId}?organisationId=${organisationId}`
        )
            .then((r) => r.json())
            .then(setSchedule)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [organisationId, selectedClassroomId]);

    /* ---------- Teachers map (id → name) ---------- */
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

    /* ---------- Outgoing requests ---------- */
    const fetchOutgoing = () => {
        fetch(`/api/substitution?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setOutgoingRequests)
            .catch(console.error);
    };

    useEffect(() => {
        fetchOutgoing();
    }, [organisationId]);

    /* ---------- Clerical profile + incoming requests ---------- */
    const fetchIncoming = (teacherId?: string) => {
        const tid = teacherId ?? clericalEntry?.teacherId;
        if (!tid) return;
        fetch(`/api/substitution/incoming?organisationId=${organisationId}`)
            .then((r) => r.json())
            .then(setIncomingRequests)
            .catch(() => { });
    };

    useEffect(() => {
        fetch("/api/profile/clerical")
            .then((r) => r.json())
            .then(
                (data: {
                    clerical: {
                        clerkUserId: string;
                        teacherIds: ClericalEntry[];
                    } | null;
                }) => {
                    if (!data.clerical) return;
                    const entry = data.clerical.teacherIds.find(
                        (t) => t.organisationId === organisationId
                    );
                    if (entry) {
                        setClericalEntry(entry);
                        fetchIncoming(entry.teacherId);
                    }
                }
            )
            .catch(() => { });
    }, [organisationId]);

    const currentClassroom = classrooms.find(
        (c) => c.classroomId === selectedClassroomId
    );

    return (
        <div className="flex gap-6 flex-col lg:flex-row">
            {/* ---- Left: schedule grid ---- */}
            <div className="flex-1 min-w-0">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                        Classroom
                    </label>
                    <select
                        value={selectedClassroomId ?? ""}
                        onChange={(e) =>
                            setSelectedClassroomId(e.target.value || null)
                        }
                        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Choose classroom</option>
                        {classrooms.map((c) => (
                            <option
                                key={c.classroomId}
                                value={c.classroomId}
                            >
                                {c.className}
                                {c.department ? ` (${c.department})` : ""}
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

            {/* ---- Right: request panels ---- */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4">
                {/* Incoming panel (clericals only) */}
                {clericalEntry && (
                    <ClericalRequestList
                        requests={incomingRequests}
                        onRefresh={() => fetchIncoming()}
                        teachersMap={teachersMap}
                    />
                )}

                {/* Outgoing panel */}
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
