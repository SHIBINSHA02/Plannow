
export interface Subject {
    subject: string;
    defaultTeacherId?: string;
    weeklyHours?: number;
}


export interface ClassroomAdmin {
    name: string;
    imageUrl: string | null;
}

export interface Classroom {
    organisationId: string;
    classroomId: string;
    className: string;
    department?: string;

    subjects: Subject[];

 
    admin?: ClassroomAdmin;

    createdAt?: Date;
    updatedAt?: Date;
}
