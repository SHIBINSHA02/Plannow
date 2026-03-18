"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export default function OnboardingPage() {
    const params = useParams();
    const router = useRouter();
    const tokenId = params.tokenId as string;

    const [loading, setLoading] = useState(true);
    const [tokenData, setTokenData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Form states
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch(`/api/onboarding/${tokenId}`);
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.message || "Invalid or expired link.");
                } else {
                    const data = await res.json();
                    setTokenData(data);
                }
            } catch (err) {
                setError("Failed to load onboarding data.");
            } finally {
                setLoading(false);
            }
        };

        if (tokenId) fetchToken();
    }, [tokenId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/onboarding/${tokenId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Failed to submit form.");
                setSubmitting(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError("Failed to submit form.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-gray-500 font-medium">Loading link details...</p>
                </div>
            </div>
        );
    }

    if (error && !tokenData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Invalid or Expired</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => router.push("/")} className="w-full bg-gray-900 text-white rounded-xl py-3 font-semibold hover:bg-gray-800 transition">Return Home</button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">✓</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Submission Successful!</h1>
                    <p className="text-gray-600 mb-6">Your details have been submitted and are pending admin approval.</p>
                </div>
            </div>
        );
    }

    const isTeacher = tokenData?.type === "TEACHER";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SignedOut>
                <div className="text-center w-full max-w-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In Required</h1>
                    <p className="text-gray-600 mb-8">Please sign in or create an account to proceed with the onboarding process for {tokenData?.organisationName}.</p>
                    <div className="flex justify-center">
                        <SignIn routing="hash" />
                    </div>
                </div>
            </SignedOut>

            <SignedIn>
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-xl w-full border border-gray-100">
                    <div className="mb-8">
                        <div className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-1">{isTeacher ? "Teacher Onboarding" : "Classroom Onboarding"}</div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{tokenData?.organisationName}</h1>
                        <p className="text-gray-500 mt-2">Please fill in the details below to submit your joining request.</p>
                    </div>

                    {tokenData?.instructions && (
                        <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Instructions from Admin
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800/80">
                                {tokenData.instructions.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-1">•</span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isTeacher ? (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Comma Separated)</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Math, Physics" onChange={e => setFormData({ ...formData, subjects: e.target.value.split(',').map((s: string) => s.trim()) })} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Classroom Name</label>
                                    <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Class 10A" onChange={e => setFormData({ ...formData, className: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Classroom ID</label>
                                    <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="CLS-10A" onChange={e => setFormData({ ...formData, classroomId: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                                    <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="admin@example.com" onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Science" onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                </div>
                            </>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : "Submit Details"}
                        </button>
                    </form>
                </div>
            </SignedIn>
        </div>
    );
}
