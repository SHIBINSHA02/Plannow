"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    subjects: string[];
};

type SubjectInput = {
    subject: string;
    weeklyHours: number;
    defaultTeacherId: string;
    teacherName: string; // Used for UI display
};

export default function OnboardingPage() {
    const params = useParams();
    const router = useRouter();
    const tokenId = params.tokenId as string;

    const [loading, setLoading] = useState(true);
    const [tokenData, setTokenData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Form states
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    // Teachers list for classroom onboarding
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(false);

    // Classroom subjects states
    const [subjects, setSubjects] = useState<SubjectInput[]>([]);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showTeacherList, setShowTeacherList] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [weeklyHours, setWeeklyHours] = useState("");

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch(`/api/onboarding/${tokenId}`);
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.message || "Invalid or expired link.");
                } else {
                    const data = await res.json();
                    setTokenData(data);

                    // Fetch teachers if Classroom Onboarding
                    if (data.type === "CLASSROOM" && data.organisationId) {
                        try {
                            setTeachersLoading(true);
                            const tRes = await fetch(`/api/teachers?organisationId=${data.organisationId}`);
                            if (tRes.ok) {
                                const tData = await tRes.json();
                                setTeachers(tData);
                            }
                        } catch (tErr) {
                            console.error("Failed to load teachers:", tErr);
                        } finally {
                            setTeachersLoading(false);
                        }
                    }
                }
            } catch (err) {
                setError("Failed to load onboarding data.");
            } finally {
                setLoading(false);
            }
        };

        if (tokenId) fetchToken();
    }, [tokenId]);

    const filteredTeachers = teachers.filter(t =>
        t.teacherName.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const selectTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setTeacherSearch(teacher.teacherName);
        setSelectedSubject("");
        setShowTeacherList(false);
    };

    const handleAddSubject = () => {
        if (!selectedTeacher || !selectedSubject || !weeklyHours) return;
        
        if (subjects.some(s => s.subject === selectedSubject)) {
            setError("This subject has already been added.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setSubjects(prev => [
            ...prev,
            {
                subject: selectedSubject,
                weeklyHours: Number(weeklyHours),
                defaultTeacherId: selectedTeacher.teacherId,
                teacherName: selectedTeacher.teacherName,
            },
        ]);

        // Reset subject inputs, keeping the teacher search in place
        setSelectedSubject("");
        setWeeklyHours("");
        setError(null);
    };

    const handleRemoveSubject = (index: number) => {
        setSubjects(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (tokenData?.type === "CLASSROOM") {
                if (!payload.className || !payload.adminEmail) {
                    setError("Classroom Name and Admin Email are required.");
                    setSubmitting(false);
                    return;
                }
                if (subjects.length === 0) {
                    setError("Please add at least one subject to submit your request.");
                    setSubmitting(false);
                    return;
                }

                // Auto-generate safe classroom ID
                const slug = payload.className.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                payload.classroomId = `CLS-${slug}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                
                // Map subjects correctly
                payload.subjects = subjects.map(s => ({
                    subject: s.subject,
                    weeklyHours: s.weeklyHours,
                    defaultTeacherId: s.defaultTeacherId,
                }));
            }

            const res = await fetch(`/api/onboarding/${tokenId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Failed to submit form.");
                setSubmitting(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError("Failed to submit form.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/70">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading link details...</p>
                </div>
            </div>
        );
    }

    if (error && !tokenData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/70 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Invalid or Expired</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => router.push("/")} className="w-full bg-gray-900 text-white rounded-xl py-3 font-semibold hover:bg-gray-800 transition">Return Home</button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/70 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">✓</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Submission Successful!</h1>
                    <p className="text-gray-600 mb-6">Your details have been submitted and are pending admin approval.</p>
                </div>
            </div>
        );
    }

    const isTeacher = tokenData?.type === "TEACHER";

    return (
        <div className="min-h-screen bg-gray-50/70 flex items-center justify-center p-4">
            <SignedOut>
                <div className="text-center w-full max-w-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In Required</h1>
                    <p className="text-gray-600 mb-8">Please sign in or create an account to proceed with the onboarding process for {tokenData?.organisationName}.</p>
                    <div className="flex justify-center">
                        <SignIn routing="hash" />
                    </div>
                </div>
            </SignedOut>

            <SignedIn>
                <div className={`bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100 transition-all duration-300 ${isTeacher ? "max-w-xl" : "max-w-2xl"}`}>
                    <div className="mb-8">
                        <div className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-1">{isTeacher ? "Teacher Onboarding" : "Classroom Onboarding"}</div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{tokenData?.organisationName}</h1>
                        <p className="text-gray-500 mt-2">Please fill in the details below to submit your joining request.</p>
                    </div>

                    {tokenData?.instructions && (
                        <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Instructions from Admin
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800/80">
                                {tokenData.instructions.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-1">•</span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isTeacher ? (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Comma Separated)</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Math, Physics" onChange={e => setFormData({ ...formData, subjects: e.target.value.split(',').map((s: string) => s.trim()) })} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Classroom Name <span className="text-red-500">*</span></label>
                                        <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Class 10A" onChange={e => setFormData({ ...formData, className: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Science" onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email <span className="text-red-500">*</span></label>
                                    <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="admin@example.com" onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                                </div>

                                <div className="border-t border-gray-100 my-6 pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Configure Subjects & Teachers</h3>
                                    <p className="text-xs text-gray-500 mb-4">Add the subjects taught in this classroom along with their weekly periods and assigned teachers.</p>

                                    <div className="bg-gray-50/50 border border-gray-200/60 rounded-2xl p-4 space-y-4 shadow-inner">
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Search & Select Teacher</label>
                                            <input
                                                type="text"
                                                value={teacherSearch}
                                                onChange={e => {
                                                    setTeacherSearch(e.target.value);
                                                    setShowTeacherList(true);
                                                    if (selectedTeacher && selectedTeacher.teacherName !== e.target.value) {
                                                        setSelectedTeacher(null);
                                                    }
                                                }}
                                                onFocus={() => setShowTeacherList(true)}
                                                placeholder="Type teacher name..."
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                                            />

                                            {showTeacherList && teacherSearch && (
                                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-gray-50">
                                                    {teachersLoading && (
                                                        <div className="p-3 text-xs text-center text-gray-400">Loading teachers...</div>
                                                    )}
                                                    {!teachersLoading && filteredTeachers.length === 0 && (
                                                        <div className="p-3 text-xs text-center text-gray-400">No teachers found</div>
                                                    )}
                                                    {filteredTeachers.map(t => (
                                                        <div
                                                            key={t.teacherId}
                                                            onClick={() => selectTeacher(t)}
                                                            className="p-3 cursor-pointer text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                        >
                                                            {t.teacherName}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                            <div className="sm:col-span-7 relative">
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Subject</label>
                                                <select
                                                    value={selectedSubject}
                                                    onChange={e => setSelectedSubject(e.target.value)}
                                                    disabled={!selectedTeacher}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm disabled:opacity-50 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {selectedTeacher?.subjects.map((sub: string) => (
                                                        <option key={sub} value={sub}>
                                                            {sub}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 top-[26px] flex items-center pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Hrs/Wk</label>
                                                <input
                                                    type="number"
                                                    placeholder="Hours"
                                                    value={weeklyHours}
                                                    onChange={e => setWeeklyHours(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                                                    min="1"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAddSubject}
                                                    disabled={!selectedTeacher || !selectedSubject || !weeklyHours}
                                                    className="w-full h-[42px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold active:scale-95 transition disabled:opacity-50 text-sm flex items-center justify-center shadow-md shadow-blue-500/10"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subjects List */}
                                    <div className="mt-6 space-y-3">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Configured Subjects ({subjects.length})</label>
                                        
                                        {subjects.length === 0 && (
                                            <div className="text-sm italic p-6 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
                                                No subjects added yet. Configure at least one subject to proceed.
                                            </div>
                                        )}

                                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                            {subjects.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow transition"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800 text-sm">{s.subject}</span>
                                                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">{s.weeklyHours} hrs/wk</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span>Teacher: {s.teacherName}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSubject(idx)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition group"
                                                    >
                                                        <svg className="w-5 h-5 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : "Submit Joining Request"}
                        </button>
                    </form>
                </div>
            </SignedIn>
        </div>
    );
}
