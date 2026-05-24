import type { SubjectInput, Teacher } from "./types";

type Props = {
    subjects: SubjectInput[];
    teachers: Teacher[];
    updateSubject: (index: number, updates: Partial<SubjectInput>) => void;
    removeSubject: (index: number) => void;
    clearAllSubjects: (e: React.MouseEvent) => void;
};

export default function SubjectListSection({
    subjects,
    teachers,
    updateSubject,
    removeSubject,
    clearAllSubjects,
}: Props) {
    return (
        <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-gray-600 block">
                Current Subjects ({subjects.length})
            </label>

            {subjects.length === 0 && (
                <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-xl text-center">
                    No subjects added yet.
                </div>
            )}

            {subjects.map((s, idx) => (
                <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="md:col-span-5 space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            Subject Name
                        </label>
                        <select
                            value={s.subject}
                            onChange={e => updateSubject(idx, { subject: e.target.value })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                        >
                            <option value="">Select Subject</option>
                            {teachers
                                .find(t => t.teacherId === s.defaultTeacherId)
                                ?.subjects.map(sub => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            Hrs/Wk
                        </label>
                        <input
                            type="number"
                            value={s.weeklyHours}
                            onChange={e => updateSubject(idx, { weeklyHours: Number(e.target.value) })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                            min="1"
                        />
                    </div>

                    <div className="md:col-span-4 space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            Assigned Teacher
                        </label>
                        <select
                            value={s.defaultTeacherId}
                            onChange={e => updateSubject(idx, { defaultTeacherId: e.target.value })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                                <option key={t.teacherId} value={t.teacherId}>
                                    {t.teacherName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                        <button
                            type="button"
                            onClick={() => removeSubject(idx)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all group"
                            aria-label="Remove subject"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:scale-110 transition-transform"
                            >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={clearAllSubjects}
                    className="px-4 rounded-xl py-3 bg-black text-white mt-4 border border-gray-700"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}
