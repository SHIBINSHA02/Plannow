export type SubjectInput = {
    subject: string;
    weeklyHours: number;
    defaultTeacherId: string;
};

export type Teacher = {
    _id: string;
    teacherId: string;
    teacherName: string;
    subjects: string[];
};

export type EditClassOnboardingProps = {
    organisationId: string;
    classroomId: string;
    currentClassroom: any;
    adminEmail?: string;
    onSuccess?: () => void;
};
