"use client";

import { useState } from "react";
import ClassOnboarding from "./ClassOnboarding";
import { useTheme } from "@/app/theme-provider";

/* ---------- Props ---------- */

type Props = {
    organisationId: string;
    onClose?: () => void;
};

/* ---------- Component ---------- */

export default function ClassOnboardingModal({
    organisationId,
    onClose,
}: Props) {
    const [open, setOpen] = useState(false);
    const { theme } = useTheme();

    return (
        <>
            {/* Open Modal Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all active:scale-95 shadow-sm`}
            >
                + Create Classroom
            </button>

            {/* Modal Overlay and Container */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div
                        className={`relative w-full max-w-2xl p-6 rounded-xl border shadow-2xl transition-all duration-200
                            ${theme === "light"
                                ? "bg-white border-gray-200 text-gray-900"
                                : "bg-[#0f172a] border-slate-800 text-slate-100"}`}
                    >
                        {/* Close Button Cross */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                onClose?.();
                            }}
                            className={`absolute text-2xl font-light top-4 right-4 transition-colors leading-none
                                ${theme === "light" ? "text-gray-400 hover:text-gray-700" : "text-slate-500 hover:text-slate-200"}`}
                        >
                            &times;
                        </button>

                        <h2 className="mb-5 text-xl font-semibold tracking-tight">
                            Create Classroom
                        </h2>

                        {/* Nested Form Wrapper */}
                        <ClassOnboarding
                            organisationId={organisationId}
                            onSuccess={() => {
                                setOpen(false);
                                onClose?.(); // refresh context lists
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}