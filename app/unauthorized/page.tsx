// app/unauthorized/page.tsx   (or wherever you want to place it)

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // ← optional: install lucide-react if you want the icon

export default function Unauthorized() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Status code - big & subtle */}
                <h1 className="text-8xl sm:text-9xl font-bold text-blue-600/20 tracking-tight select-none">
                    403
                </h1>

                {/* Main message */}
                <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                        Access Denied
                    </h2>
                    <p className="text-lg text-gray-600">
                        You don’t have permission to view this page.
                    </p>
                </div>

                {/* Secondary explanation */}
                <p className="text-gray-500">
                    If you believe this is an error, please contact your administrator or
                    support team.
                </p>

                {/* Actions */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>

                    <button
                        onClick={() => router.replace("/")}
                        className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Return to Home
                    </button>
                </div>

                {/* Optional subtle footer / branding */}
                <p className="pt-8 text-sm text-gray-400">
                    © {new Date().getFullYear()} Plannow.in
                </p>
            </div>
        </div>
    );
}