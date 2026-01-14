"use client";

import { useState } from "react";
import ClassOnboarding from "./ClassOnboarding";

export default function ClassOnboardingModal() {
    const [open, setOpen] = useState(false);

    return (
        <>
           
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
                + Create Classroom
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-2xl p-6 bg-white rounded-xl">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute text-2xl text-gray-600 top-3 right-4"
                        >
                            ×
                        </button>

                        <h2 className="mb-4 text-xl font-semibold">
                            Create Classroom
                        </h2>

                        <ClassOnboarding
                            onSuccess={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
