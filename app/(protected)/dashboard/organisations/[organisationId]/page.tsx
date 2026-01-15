"use client";

import ClassroomGrid from "./_components/ClassroomGrid";
import ClassOnboardingModal from "./_components/ClassOnboardingModal";
import TeachersSection from "./_components/Teachers/TeachersSection";
export default function OrganisationPage() {
    return (
        <div className="space-y-6">
       
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Classrooms
                </h1>

            
                <ClassOnboardingModal />
            </div>

            {/* Classroom list */}
            <ClassroomGrid />
            <TeachersSection />
        </div>
    );
}
