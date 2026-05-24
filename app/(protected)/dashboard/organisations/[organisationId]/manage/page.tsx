"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/theme-provider";
import { ArrowLeft, Save, Trash2, Settings, AlertTriangle, Building2 } from "lucide-react";

export default function ManageOrganisationPage() {
    const { theme } = useTheme();
    const { organisationId } = useParams();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    /* ---------- Theme Helpers (Matching your Schedule Page) ---------- */
    const cardBase = `p-6 rounded-2xl shadow-sm border ${theme === "light" ? "bg-white border-gray-200" : "bg-[#0f172a] border-slate-800"
        }`;
    const textColor = theme === "light" ? "text-gray-900" : "text-white";
    const subTextColor = theme === "light" ? "text-gray-500" : "text-slate-400";
    const inputBase = `w-full px-3 py-2 border rounded-lg outline-none transition ${theme === "light"
            ? "bg-white border-gray-300 focus:border-blue-500"
            : "bg-[#0f172a] border-slate-700 focus:border-blue-500 text-white"
        }`;

    return (
        <div className="space-y-6 max-w-5xl lg:mx-auto lg:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className={`p-2 rounded-lg border transition ${theme === "light" ? "border-gray-200 hover:bg-gray-100" : "border-slate-800 hover:bg-slate-800"}`}
                >
                    <ArrowLeft size={20} className={textColor} />
                </button>
                <div>
                    <h1 className={`text-2xl font-bold ${textColor}`}>Manage Organisation</h1>
                    <p className={`text-sm ${subTextColor}`}>ID: {organisationId}</p>
                </div>
            </div>

            {/* Main Settings Card */}
            <div className={cardBase}>
                <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${textColor}`}>
                    <Settings size={20} className="text-blue-500" />
                    General Settings
                </h3>

                <div className="space-y-5 max-w-xl">
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Organisation Name</label>
                        <input type="text" className={inputBase} placeholder="Enter name..." />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Description</label>
                        <textarea className={`${inputBase} h-24`} placeholder="Tell us about this organisation..." />
                    </div>

                    <button
                        onClick={() => setIsSaving(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className={`p-6 rounded-2xl border ${theme === "light" ? "bg-red-50/50 border-red-200" : "bg-red-950/10 border-red-900/50"}`}>
                <h3 className="flex items-center gap-2 text-red-600 font-bold mb-2">
                    <AlertTriangle size={18} />
                    Danger Zone
                </h3>
                <p className={`text-sm mb-4 ${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                    Permanently delete this organisation and all its associated data. This action cannot be undone.
                </p>
                <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-lg dark:border-red-900 transition">
                    <Trash2 size={16} />
                    Delete Organisation
                </button>
            </div>
        </div>
    );
}