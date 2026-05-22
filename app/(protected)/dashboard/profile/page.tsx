"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/app/theme-provider";
import { Camera, Building2, Mail, ShieldCheck, X, Activity, Clock, Briefcase, Loader2 } from "lucide-react";

type Organisation = {
    _id: string;
    name: string;
    organisationId: string;
};

type ProfileData = {
    user: {
        name: string;
        email: string;
        imageUrl?: string;
        role: string;
    };
    organisations: Organisation[];
    stats: {
        totalSubstitutions: number;
        totalOrganisations: number;
        totalWorkingHours: number;
    };
};

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit States
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile interface content");
                return res.json();
            })
            .then((data) => {
                setData(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await uploadImage(base64String);
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = async (base64String: string) => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: base64String }),
            });

            if (res.ok && data) {
                setData({
                    ...data,
                    user: { ...data.user, imageUrl: base64String },
                });
            }
        } catch (err) {
            console.error("Image state modification failed:", err);
        } finally {
            setSaving(false);
        }
    };

    /* ---------- Loading Layout State ---------- */
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin stroke-[2.5]" />
            <p className={`text-xs font-light ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                Synchronizing dashboard profile metrics...
            </p>
        </div>
    );

    /* ---------- Error Layout State ---------- */
    if (error) return (
        <div className={`max-w-2xl mx-auto mt-10 p-5 rounded-3xl border flex items-center gap-4 text-xs font-light
            ${theme === "light"
                ? "bg-red-50 border-red-100 text-red-600 shadow-sm"
                : "bg-red-950/10 border-red-900/30 text-red-400"}`}
        >
            <X className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <p className="font-medium">{error}</p>
        </div>
    );

    if (!data) return null;

    const { user, organisations, stats } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-10 px-6 w-full">

            {/* --- Profile Header Panel --- */}
            <div
                className={`relative border rounded-3xl overflow-hidden shadow-sm transition-all duration-200
                    ${theme === "light"
                        ? "border-slate-100 bg-white shadow-slate-100/50"
                        : "border-slate-800/80 bg-[#0f172a] shadow-none"}`}
            >
                <div className={`h-32 rounded-t-3xl ${theme === "light" ? "bg-blue-600" : "bg-blue-600/80"}`} />

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end gap-5 text-center md:text-left">

                        {/* Avatar Image Shell */}
                        <div className="relative mx-auto md:mx-0 group">
                            <div
                                className={`w-32 h-32 rounded-2xl border-4 overflow-hidden shadow-md flex items-center justify-center select-none
                                    ${theme === "light" ? "border-white bg-slate-50" : "border-[#0f172a] bg-slate-900"}`}
                            >
                                {user.imageUrl ? (
                                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-4xl font-semibold 
                                        ${theme === "light" ? "bg-blue-50 text-blue-500" : "bg-blue-950/40 text-blue-400"}`}
                                    >
                                        {user.name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={saving}
                                className={`absolute bottom-2 right-2 p-2 rounded-xl shadow border transition-all active:scale-[0.95]
                                    ${theme === "light"
                                        ? "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600"
                                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                                    } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Administrative Details Metadata */}
                        <div className="flex-1 pb-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                <h1 className={`text-xl font-medium tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                    {user.name}
                                </h1>
                                <span
                                    className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider border w-fit mx-auto md:mx-0
                                        ${theme === "light"
                                            ? "bg-blue-50 border-blue-100 text-blue-600"
                                            : "bg-blue-950/30 border-blue-900/40 text-blue-400"}`}
                                >
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1.5 text-xs font-light">
                                <span className={`flex items-center gap-1.5 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                    <Mail className={`w-3.5 h-3.5 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`} />
                                    {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-500/90 font-normal">
                                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Verified Handle
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- Core Analytics Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={<Activity className="w-4 h-4 text-blue-500 stroke-[2.5]" />}
                    label="Substitutions"
                    value={stats.totalSubstitutions}
                    description="Accepted requests"
                    theme={theme}
                />
                <StatCard
                    icon={<Briefcase className="w-4 h-4 text-blue-500" />}
                    label="Organisations"
                    value={stats.totalOrganisations}
                    description="Active memberships"
                    theme={theme}
                />
                <StatCard
                    icon={<Clock className="w-4 h-4 text-blue-500" />}
                    label="Working Hours"
                    value={stats.totalWorkingHours}
                    suffix="h"
                    description="Weekly workload"
                    theme={theme}
                />
            </div>

            {/* --- Connected Organisations Section --- */}
            <div
                className={`border rounded-3xl overflow-hidden shadow-sm transition-all duration-200
                    ${theme === "light"
                        ? "border-slate-100 bg-white shadow-slate-100/50"
                        : "border-slate-800/80 bg-[#0f172a] shadow-none"}`}
            >
                <div className={`px-6 py-4 border-b flex items-center justify-between
                    ${theme === "light" ? "border-slate-50 bg-slate-50/40" : "border-slate-800/60 bg-slate-900/20"}`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`} />
                        <h3 className={`text-sm font-medium tracking-tight ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                            Connected Organisations
                        </h3>
                    </div>
                </div>

                <div className="p-6">
                    {organisations.length === 0 ? (
                        <div className={`text-center py-10 border border-dashed rounded-2xl text-xs font-light
                            ${theme === "light" ? "border-slate-100 text-slate-400" : "border-slate-800 text-slate-500"}`}
                        >
                            No structural organisations linked to this administrative node.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {organisations.map((org) => (
                                <div
                                    key={org._id}
                                    className={`group p-4 rounded-2xl border transition-all duration-200
                                        ${theme === "light"
                                            ? "bg-slate-50/40 border-slate-100 text-slate-800 hover:border-slate-200 hover:bg-slate-50"
                                            : "bg-slate-900/20 border-slate-800/60 text-slate-300 hover:border-slate-700/60 hover:bg-slate-900/40"}`}
                                >
                                    <div className="flex items-center gap-3.5 overflow-hidden">
                                        <div
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                                ${theme === "light"
                                                    ? "bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white"
                                                    : "bg-slate-800/80 text-slate-400 group-hover:bg-blue-500 group-hover:text-white"}`}
                                        >
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className={`text-sm font-medium truncate ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>
                                                {org.name}
                                            </p>
                                            <p className={`text-[10px] font-mono tracking-tight truncate ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                                                ID: {org.organisationId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Asynchronous Save Notification Toast --- */}
            {saving && (
                <div
                    className={`fixed bottom-6 right-6 border px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200
                        ${theme === "light"
                            ? "bg-white border-slate-100 text-slate-800 shadow-slate-200/60"
                            : "bg-slate-900 border-slate-800 text-slate-200 shadow-none"}`}
                >
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    <p className="text-xs font-light">Updating directory assets...</p>
                </div>
            )}
        </div>
    );
}

/* ---------------- Internal Components ---------------- */

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix?: string;
    description: string;
    theme: string;
}

function StatCard({
    icon,
    label,
    value,
    suffix = "",
    description,
    theme
}: StatCardProps) {
    return (
        <div
            className={`p-5 rounded-3xl border transition-all duration-200 group
                ${theme === "light"
                    ? "bg-white border-slate-100 shadow-sm shadow-slate-100/40 hover:shadow-md hover:shadow-slate-200/30"
                    : "bg-[#0f172a] border-slate-800/80 shadow-none hover:border-slate-700/60"}`}
        >
            <div className="flex items-center gap-2.5 mb-3.5">
                <div
                    className={`p-2 rounded-xl transition-colors
                        ${theme === "light" ? "bg-slate-50 group-hover:bg-slate-100" : "bg-slate-900 group-hover:bg-slate-800"}`}
                >
                    {icon}
                </div>
                <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                </h4>
            </div>

            <div className="space-y-0.5">
                <div className="flex items-baseline gap-0.5">
                    <span className={`text-2xl font-semibold tracking-tight leading-none ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        {value}
                    </span>
                    {suffix && (
                        <span className={`text-sm font-medium ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                            {suffix}
                        </span>
                    )}
                </div>
                <p className={`text-[11px] font-light ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                    {description}
                </p>
            </div>
        </div>
    );
}