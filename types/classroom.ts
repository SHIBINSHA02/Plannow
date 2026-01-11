export interface Subject {
    subject: string;
    defaultTeacherId?: string;
    weeklyHours?: number;
}

export interface Classroom {
    organisationId: string;
    classroomId: string;
    className: string;
    department?: string;
    subjects: Subject[];
    createdAt?: Date;
    updatedAt?: Date;
}
