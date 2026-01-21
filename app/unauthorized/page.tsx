"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-blue-300 via-white to-blue-200 px-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-gray-100 px-8 py-10 text-center">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo.svg"
                        alt="Company Logo"
                        className="h-12 object-contain"
                    />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-semibold text-blue-600 tracking-tight">
                    Access Denied
                </h1>

                {/* Subtitle */}
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                    You don’t have permission to access this page.
                </p>

                <p className="mt-1 text-gray-400 text-sm">
                    Please contact your organization administrator if you think
                    this is a mistake.
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Action */}
                <button
                    onClick={() => router.replace("/")}
                    className="w-full inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}
