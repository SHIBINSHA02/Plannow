"use client";

import ClassOnboarding from "./ClassOnboarding";

export default function ClassOnboardingModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="relative w-full max-w-2xl bg-white rounded-xl p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-2xl text-gray-600"
                >
                    ×
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    Create Classroom
                </h2>

                <ClassOnboarding onSuccess={onClose} />
            </div>
        </div>
    );
}
