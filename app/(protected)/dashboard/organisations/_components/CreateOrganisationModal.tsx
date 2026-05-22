"use client";

import { useState } from "react";
import { useTheme } from "@/app/theme-provider";
import { Loader2, Plus, X } from "lucide-react";

interface CreateOrganisationModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateOrganisationModal({
    open,
    onClose,
}: CreateOrganisationModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    if (!open) return null;

    const submit = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/organisation/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organisationName: name }),
            });

            if (res.ok) {
                setName("");
                onClose();
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to create new organisation:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
            <div
                className={`relative p-6 rounded-3xl w-full max-w-sm border shadow-xl transition-all duration-200 scale-in-95
                    ${theme === "light"
                        ? "bg-white border-slate-100 shadow-slate-200/50 text-slate-800"
                        : "bg-[#0f172a] border-slate-800 shadow-none text-slate-200"}`}
            >
                {/* Close Button Header Icon */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors
                        ${theme === "light" ? "hover:bg-slate-100 text-slate-400" : "hover:bg-slate-800 text-slate-500"}`}
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Title Section */}
                <div className="mb-5 space-y-1">
                    <h2 className={`text-base font-medium tracking-tight flex items-center gap-2 ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        Create New Workspace
                    </h2>
                    <p className={`text-xs font-light ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        Register a new institution environment under your administrative handle.
                    </p>
                </div>

                {/* Main Input Control */}
                <div className="space-y-4 mb-6">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., Nexus Labs International"
                        className={`w-full px-4 py-2.5 text-xs font-light rounded-xl border outline-none focus:ring-4 transition-all
                            ${theme === "light"
                                ? "border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-blue-500/10 focus:border-blue-500"
                                : "border-slate-800 bg-slate-900 text-slate-200 focus:bg-[#0f172a] focus:ring-blue-500/5 focus:border-blue-400"
                            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                </div>

                {/* Action Row Layout */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`text-xs px-4 py-2 font-medium rounded-xl transition-all active:scale-[0.97]
                            ${theme === "light"
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            } ${loading ? "opacity-50 cursor-not-allowed active:scale-100" : ""}`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading || !name.trim()}
                        className={`inline-flex items-center justify-center gap-1.5 text-xs px-4 py-2 font-medium rounded-xl transition-all active:scale-[0.97] text-white shadow-sm
                            ${theme === "light" ? "bg-blue-600 shadow-blue-500/10 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}
                            ${loading || !name.trim() ? "opacity-50 cursor-not-allowed active:scale-100" : ""}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Creating Workspace...
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                Create Workspace
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}