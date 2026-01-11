export interface ScheduleSlot {
    organisationId: string;
    classroomId: string;
    teacherId: string;
    subject: string;
    day: number;
    period: number;
    createdAt?: Date;
    updatedAt?: Date;
}
