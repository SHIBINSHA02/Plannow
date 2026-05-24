"use client";

import AddSubjectSection from "./AddSubjectSection";
import ClassroomDetailsSection from "./ClassroomDetailsSection";
import SubjectListSection from "./SubjectListSection";
import type { EditClassOnboardingProps } from "./types";
import { useEditClassOnboarding } from "./useEditClassOnboarding";

export default function EditClassOnboarding(props: EditClassOnboardingProps) {
    const {
        className,
        setClassName,
        department,
        setDepartment,
        adminEmail,
        setAdminEmail,
        teachers,
        teachersLoading,
        teacherSearch,
        setTeacherSearch,
        selectedTeacher,
        setSelectedTeacher,
        showTeacherList,
        setShowTeacherList,
        selectedSubject,
        setSelectedSubject,
        weeklyHours,
        setWeeklyHours,
        subjects,
        loading,
        error,
        successMsg,
        filteredTeachers,
        selectTeacher,
        addSubject,
        removeSubject,
        clearAllSubjects,
        updateSubject,
        submit,
    } = useEditClassOnboarding(props);

    return (
        <form
            onSubmit={submit}
            className="space-y-5 text-gray-700 mt-8 border-t border-blue-700 pt-10 w-full max-w-7xl mx-auto"
        >
            <ClassroomDetailsSection
                className={className}
                setClassName={setClassName}
                department={department}
                setDepartment={setDepartment}
                adminEmail={adminEmail}
                setAdminEmail={setAdminEmail}
                error={error}
                successMsg={successMsg}
            />

            <AddSubjectSection
                teacherSearch={teacherSearch}
                setTeacherSearch={setTeacherSearch}
                selectedTeacher={selectedTeacher}
                setSelectedTeacher={setSelectedTeacher}
                showTeacherList={showTeacherList}
                setShowTeacherList={setShowTeacherList}
                teachersLoading={teachersLoading}
                filteredTeachers={filteredTeachers}
                selectTeacher={selectTeacher}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                weeklyHours={weeklyHours}
                setWeeklyHours={setWeeklyHours}
                addSubject={addSubject}
            />

            <SubjectListSection
                subjects={subjects}
                teachers={teachers}
                updateSubject={updateSubject}
                removeSubject={removeSubject}
                clearAllSubjects={clearAllSubjects}
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 mt-6"
            >
                {loading ? "Saving Changes..." : "Save Classroom Details"}
            </button>
        </form>
    );
}
