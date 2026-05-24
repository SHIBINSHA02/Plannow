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
    return (
        <div className="bg-gray-50/50 py-4 rounded-2xl space-y-4 text-sm mt-4">
            <h3 className="font-medium text-xl text-blue-700">Add Subjects</h3>
            <div className="relative">
                <label className="text-sm font-medium text-gray-600 mb-1 block">
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
                    className="w-full p-2 border border-gray-200 rounded-xl bg-white"
                />

                {showTeacherList && teacherSearch && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto z-50">
                        {teachersLoading && (
                            <div className="p-3 text-sm text-gray-400 text-center">
                                Loading teachers...
                            </div>
                        )}

                        {!teachersLoading && filteredTeachers.length === 0 && (
                            <div className="p-3 text-sm text-gray-400 text-center">
                                No teachers found
                            </div>
                        )}

                        {filteredTeachers.map(t => (
                            <div
                                key={t.teacherId}
                                onClick={() => selectTeacher(t)}
                                className="p-3 cursor-pointer hover:bg-blue-50 border-b last:border-0"
                            >
                                {t.teacherName}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        disabled={!selectedTeacher}
                        className="w-full p-2 border border-gray-300 rounded-xl focus:border-blue-500 bg-white disabled:opacity-50"
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
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Hrs/Wk</label>
                    <input
                        type="number"
                        placeholder="Hours"
                        value={weeklyHours}
                        onChange={e => setWeeklyHours(e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-xl bg-white"
                        min="1"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={addSubject}
                        disabled={!selectedTeacher || !selectedSubject || !weeklyHours}
                        className="px-4 py-2 h-[42px] bg-blue-600 border border-gray-200 hover:bg-blue-800 text-white rounded-xl"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
