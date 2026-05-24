import { useTheme } from "@/app/theme-provider";
import type { Teacher } from "./types";

type Props = {
    teacherSearch: string;
    setTeacherSearch: (value: string) => void;
    selectedTeacher: Teacher | null;
    setSelectedTeacher: (teacher: Teacher | null) => void;
    showTeacherList: boolean;
    setShowTeacherList: (value: boolean) => void;
    teachersLoading: boolean;
    filteredTeachers: Teacher[];
    selectTeacher: (teacher: Teacher) => void;
    selectedSubject: string;
    setSelectedSubject: (value: string) => void;
    weeklyHours: string;
    setWeeklyHours: (value: string) => void;
    addSubject: () => void;
};

const fieldClass = (theme: string) =>
    `w-full p-2 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        ${theme === "light"
            ? "border-gray-200 bg-white text-gray-900"
            : "border-slate-800 bg-slate-900 text-slate-100"}`;

export default function AddSubjectSection({
    teacherSearch,
    setTeacherSearch,
    selectedTeacher,
    setSelectedTeacher,
    showTeacherList,
    setShowTeacherList,
    teachersLoading,
    filteredTeachers,
    selectTeacher,
    selectedSubject,
    setSelectedSubject,
    weeklyHours,
    setWeeklyHours,
    addSubject,
}: Props) {
    const { theme } = useTheme();

    return (
        <div className={`py-4 rounded-2xl space-y-4 text-sm mt-4 transition-colors duration-200
            ${theme === "light" ? "bg-gray-50/50" : "bg-slate-900/40"}`}
        >
            <h3 className="font-medium text-xl text-blue-600">Add Subjects</h3>
            <div className="relative">
                <label className={`text-sm font-medium mb-1 block ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                    Search & Select Teacher
                </label>

                <input
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
                    className={fieldClass(theme)}
                />

                {showTeacherList && teacherSearch && (
                    <div className={`absolute left-0 right-0 mt-1 border rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y transition-all
                            ${theme === "light"
                                ? "bg-white border-gray-200 divide-gray-100"
                                : "bg-slate-950 border-slate-800 divide-slate-900"}`}
                    >
                        {teachersLoading && (
                            <div className={`p-3 text-sm text-center ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                                Loading teachers...
                            </div>
                        )}

                        {!teachersLoading && filteredTeachers.length === 0 && (
                            <div className={`p-3 text-sm text-center ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                                No teachers found
                            </div>
                        )}

                        {filteredTeachers.map(t => (
                            <div
                                key={t.teacherId}
                                onClick={() => selectTeacher(t)}
                                className={`p-3 cursor-pointer border-b last:border-0 transition-colors
                                    ${theme === "light"
                                        ? "hover:bg-blue-50 text-gray-700"
                                        : "hover:bg-blue-950/40 text-slate-300"}`}
                            >
                                {t.teacherName}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className={`text-sm font-medium mb-1 block ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                        Subject
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        disabled={!selectedTeacher}
                        className={`${fieldClass(theme)} disabled:opacity-50`}
                    >
                        <option value="">Select Subject</option>
                        {selectedTeacher?.subjects.map(sub => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={`text-sm font-medium mb-1 block ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                        Hrs/Wk
                    </label>
                    <input
                        type="number"
                        placeholder="Hours"
                        value={weeklyHours}
                        onChange={e => setWeeklyHours(e.target.value)}
                        className={`w-20 p-2 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                            ${theme === "light"
                                ? "border-gray-200 bg-white text-gray-900"
                                : "border-slate-800 bg-slate-900 text-slate-100"}`}
                        min="1"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={addSubject}
                        disabled={!selectedTeacher || !selectedSubject || !weeklyHours}
                        className="px-4 py-2 h-[42px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium active:scale-95 transition-all disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
