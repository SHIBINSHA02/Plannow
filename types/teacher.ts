export interface Teacher {
    teacherId: string;
    teacherName: string;
    email: string;
    subjects: string[];
    organisations: string[];
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
