"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Users,
    Calendar,
    ChevronRight,
    ChevronDown,
    BookOpen,
    ArrowUpDown,
    Building2,
    LayoutGrid,
    ListFilter
} from "lucide-react";
import ClassroomScheduleGrid from "./ClassroomScheduleGrid";

type Teacher = {
    teacherId: string;
    teacherName: string;
    subjects?: string[];
};

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
    const [loading, setLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
    const [currentUserTeacherId, setCurrentUserTeacherId] = useState<string | null>(null);
    const [organisationId, setOrganisationId] = useState<string | null>(null);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "my">("all");
    const [sortBy, setSortBy] = useState<"name" | "department">("name");
    const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Get Profile (to get organisation and current teacher ID)
                const profileRes = await fetch("/api/profile");
                const profileData = await profileRes.json();

                if (profileData.organisations?.length > 0) {
                    const orgId = profileData.organisations[0].organisationId;
                    setOrganisationId(orgId);

                    // 2. Fetch Classrooms
                    const classRes = await fetch(`/api/classrooms?organisationId=${orgId}`);
                    const classData = await classRes.json();
                    setClassrooms(classData);

                    // 3. Fetch Teachers
                    const teachRes = await fetch(`/api/teachers?organisationId=${orgId}`);
                    const teachData = await teachRes.json();
                    const map: Record<string, string> = {};
                    teachData.forEach((t: any) => {
                        map[t.teacherId] = t.teacherName;
                    });
                    setTeachersMap(map);

                    // 4. Find current user's teacherId (matching email)
                    const userEmail = profileData.user.email;
                    const teacher = teachData.find((t: any) => t.email === userEmail);
                    if (teacher) setCurrentUserTeacherId(teacher.teacherId);
                }
            } catch (err) {
                console.error("Failed to load classrooms data", err);
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
        } catch (err) {
            console.error(err);
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

    // Derived Logic
    const filteredClassrooms = classrooms
        .filter(c => {
            const matchesSearch = c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.department?.toLowerCase().includes(searchQuery.toLowerCase());

            if (filterType === "my") {
                const isMyClass = c.subjects.some(s => s.defaultTeacherId === currentUserTeacherId);
                return matchesSearch && isMyClass;
            }
            return matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === "name") return a.className.localeCompare(b.className);
            return (a.department || "").localeCompare(b.department || "");
        });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Loading classrooms...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-10 px-6">

            {/* --- Header & Controls --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Classrooms</h1>
                    <p className="text-gray-500 text-sm">Overview of organization-wide schedules and allotments.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search class or dept..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm w-full sm:w-64 shadow-sm"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setFilterType("all")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                            All Classes
                        </button>
                        <button
                            onClick={() => setFilterType("my")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === "my" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Users className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                            My Allotted
                        </button>
                    </div>

                    {/* Sort Toggle */}
                    <button
                        onClick={() => setSortBy(sortBy === "name" ? "department" : "name")}
                        className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 hover:text-blue-600 transition-all flex items-center gap-2 text-xs font-semibold px-4"
                    >
                        <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                        Sort by {sortBy === "name" ? "Name" : "Dept"}
                    </button>
                </div>
            </div>

            {/* --- Grid Listing --- */}
            {filteredClassrooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No classrooms match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredClassrooms.map((cls) => (
                        <div
                            key={cls._id}
                            className={`bg-white border transition-all duration-300 overflow-hidden ${expandedClassroom === cls.classroomId ? "rounded-3xl border-blue-200 shadow-xl shadow-blue-500/5 ring-4 ring-blue-50" : "rounded-2xl border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md"}`}
                        >
                            {/* Summary Header */}
                            <div
                                onClick={() => toggleExpand(cls.classroomId)}
                                className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${expandedClassroom === cls.classroomId ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-500"}`}>
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold text-gray-900 leading-none">{cls.className}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{cls.department || "General"}</span>
                                            <span className="text-gray-200 text-xs">|</span>
                                            <span className="text-xs text-gray-400 font-medium">{cls.subjects.length} Subjects</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Quick Teacher Previews */}
                                    <div className="flex -space-x-2">
                                        {cls.subjects.slice(0, 3).map((sub, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-500 uppercase title" title={teachersMap[sub.defaultTeacherId]}>
                                                {teachersMap[sub.defaultTeacherId]?.[0] || "?"}
                                            </div>
                                        ))}
                                        {cls.subjects.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                +{cls.subjects.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    <button className={`p-2 rounded-xl transition-all ${expandedClassroom === cls.classroomId ? "bg-blue-600 text-white rotate-180" : "bg-gray-50 text-gray-400 hover:text-blue-600"}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Content (Expandable) */}
                            {/* Detailed Content (Expandable) */}
                            {expandedClassroom === cls.classroomId && (
                                <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-300">

                                    {/* Top Stats Bar */}
                                    <div className="px-8 py-5 border-b border-gray-200/50 bg-white/60 backdrop-blur-xl">
                                        <div className="flex flex-wrap items-center justify-between gap-4">

                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                                                        Total Subjects
                                                    </p>
                                                    <p className="text-xl font-bold text-gray-800">
                                                        {cls.subjects.length}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                                                        Weekly Hours
                                                    </p>
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {cls.subjects.reduce((acc, sub) => acc + sub.weeklyHours, 0)}h
                                                    </p>
                                                </div>
                                            </div>

                                            {scheduleLoading && (
                                                <div className="flex items-center gap-2 text-xs text-blue-500 font-semibold animate-pulse">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    Syncing Schedule...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">

                                            {/* Assigned Teachers List */}
                                            <div className="xl:col-span-1 space-y-6">
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        Allotted Faculty
                                                    </h4>

                                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                                                        {cls.subjects.map((sub, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
                                                                        {teachersMap[sub.defaultTeacherId] || "TBA"}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                                                                        {sub.subject}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-xl">
                                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                                    <span className="text-xs font-semibold text-blue-600">
                                                                        {sub.weeklyHours}h
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Full Schedule Grid */}
                                            <div className="xl:col-span-3">
                                                <div className="bg-white rounded-3xl border border-gray-200/60 shadow-lg p-6">

                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            Weekly Master Schedule
                                                        </h4>
                                                    </div>

                                                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                                        <ClassroomScheduleGrid
                                                            schedule={selectedSchedule}
                                                            loading={scheduleLoading}
                                                            teachersMap={teachersMap}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
