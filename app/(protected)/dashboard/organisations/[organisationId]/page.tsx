"use client";

import { useState } from "react";
import ClassroomGrid from "./_components/ClassroomGrid";
import ClassOnboardingModal from "./_components/ClassOnboardingModal";

export default function OrganisationPage() {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Classrooms
                </h1>

                <button
                    onClick={() => setOpen(true)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    + Create Classroom
                </button>
            </div>

            {/* Classroom Grid */}
            <ClassroomGrid />

            {/* Onboarding Modal */}
            <ClassOnboardingModal
                open={open}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}
