"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Users,
    Calendar,
    ChevronDown,
    BookOpen,
    ArrowUpDown,
    Building2,
    LayoutGrid,
} from "lucide-react";
import ClassroomScheduleGrid from "./ClassroomScheduleGrid";
import { useTheme } from "@/app/theme-provider";

type Subject = {
    subject: string;
    defaultTeacherId: string;
    weeklyHours: number;
};

type Classroom = {
    _id: string;
    classroomId: string;
    className: string;
    department?: string;
    subjects: Subject[];
};

export default function ClassroomOverview() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
    const [currentUserTeacherId, setCurrentUserTeacherId] = useState<string | null>(null);
    const [organisationId, setOrganisationId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "my">("all");
    const [sortBy, setSortBy] = useState<"name" | "department">("name");
    const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                const profileRes = await fetch("/api/profile");
                const profileData = await profileRes.json();
                if (profileData.organisations?.length > 0) {
                    const orgId = profileData.organisations[0].organisationId;
                    setOrganisationId(orgId);
                    const [classRes, teachRes] = await Promise.all([
                        fetch(`/api/classrooms?organisationId=${orgId}`),
                        fetch(`/api/teachers?organisationId=${orgId}`)
                    ]);
                    const classData = await classRes.json();
                    const teachData = await teachRes.json();

                    const map: Record<string, string> = {};
                    teachData.forEach((t: any) => map[t.teacherId] = t.teacherName);
                    setTeachersMap(map);
                    setClassrooms(classData);
                    const teacher = teachData.find((t: any) => t.email === profileData.user.email);
                    if (teacher) setCurrentUserTeacherId(teacher.teacherId);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchSchedule = async (classroomId: string) => {
        if (!organisationId) return;
        setScheduleLoading(true);
        try {
            const res = await fetch(`/api/schedule/classroom/${classroomId}?organisationId=${organisationId}`);
            const data = await res.json();
            setSelectedSchedule(data);
        } finally {
            setScheduleLoading(false);
        }
    };

    const toggleExpand = (classroomId: string) => {
        if (expandedClassroom === classroomId) {
            setExpandedClassroom(null);
        } else {
            setExpandedClassroom(classroomId);
            fetchSchedule(classroomId);
        }
    };

    const filteredClassrooms = classrooms
        .filter(c => {
            const matchesSearch = c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.department?.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterType === "my") return matchesSearch && c.subjects.some(s => s.defaultTeacherId === currentUserTeacherId);
            return matchesSearch;
        })
        .sort((a, b) => sortBy === "name" ? a.className.localeCompare(b.className) : (a.department || "").localeCompare(b.department || ""));

    if (loading) return (
        <div className={`flex flex-col items-center justify-center min-h-[50vh] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading classrooms...</p>
        </div>
    );

    return (
        <div className={`max-w-8xl mx-auto space-y-8 py-10 px-6 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Classrooms</h1>
                    <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Overview of organization-wide schedules.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        placeholder="Search class or dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    />
                    <button onClick={() => setSortBy(sortBy === "name" ? "department" : "name")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4" /> Sort by {sortBy === "name" ? "Name" : "Dept"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredClassrooms.map((cls) => (
                    <div key={cls._id} className={`border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                        <div onClick={() => toggleExpand(cls.classroomId)} className="px-6 py-6 flex items-center justify-between cursor-pointer">
                            <div>
                                <h3 className="text-xl font-semibold">{cls.className}</h3>
                                <p className="text-xs text-blue-500 uppercase">{cls.department || "General"}</p>
                            </div>
                            <ChevronDown className={`w-6 h-6 transition-transform ${expandedClassroom === cls.classroomId ? "rotate-180" : ""}`} />
                        </div>

                        {expandedClassroom === cls.classroomId && (
                            <div className={`p-8 border-t ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                                <ClassroomScheduleGrid
                                    schedule={selectedSchedule}
                                    loading={scheduleLoading}
                                    teachersMap={teachersMap}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}