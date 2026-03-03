"use client";

import { useEffect, useState, useRef } from "react";
import { Camera, Building2, Mail, ShieldCheck, X, Activity, Clock, Briefcase } from "lucide-react";

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

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile");
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
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Loading profile...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center gap-4">
            <X className="w-5 h-5" />
            <p className="font-medium">{error}</p>
        </div>
    );

    if (!data) return null;

    const { user, organisations, stats } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-10 px-6">

            {/* --- Profile Header --- */}
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="h-32 bg-blue-600 rounded-t-2xl" />

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end gap-6 text-center md:text-left">
                        <div className="relative mx-auto md:mx-0">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gray-50 overflow-hidden shadow-lg">
                                {user.imageUrl ? (
                                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-semibold bg-blue-50 text-blue-400">
                                        {user.name[0]}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 p-2 bg-white text-blue-600 rounded-lg shadow border border-blue-50 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <div className="flex-1 pb-1 space-y-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {user.name}
                                </h1>
                                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full uppercase tracking-wider border border-blue-100 w-fit mx-auto md:mx-0">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-400" /> {user.email}</span>
                                <span className="flex items-center gap-1.5 text-blue-400/80">
                                    <ShieldCheck className="w-4 h-4" /> Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Statistics Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Activity className="w-5 h-5 text-blue-600" />}
                    label="Substitutions"
                    value={stats.totalSubstitutions}
                    description="Accepted requests"
                />
                <StatCard
                    icon={<Briefcase className="w-5 h-5 text-blue-600" />}
                    label="Organisations"
                    value={stats.totalOrganisations}
                    description="Active memberships"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-blue-600" />}
                    label="Working Hours"
                    value={stats.totalWorkingHours}
                    suffix="h"
                    description="Weekly workload"
                />
            </div>

            {/* --- Organisations Section --- */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-800 tracking-tight">Organisations</h3>
                    </div>
                </div>

                <div className="p-6">
                    {organisations.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-gray-100 rounded-xl">
                            <p className="text-gray-400 text-sm font-medium">No organisations linked.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {organisations.map((org) => (
                                <div key={org._id} className="group p-4 bg-white border border-gray-50 rounded-xl hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{org.name}</p>
                                            <p className="text-xs text-gray-400 font-medium font-mono truncate">{org.organisationId}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {saving && (
                <div className="fixed bottom-6 right-6 bg-white border border-blue-100 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-blue-800">Updating profile...</p>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    suffix = "",
    description
}: {
    icon: React.ReactNode,
    label: string,
    value: number,
    suffix?: string,
    description: string
}) {
    return (
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    {icon}
                </div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</h4>
            </div>
            <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-gray-900 leading-none">{value}</span>
                    <span className="text-lg font-medium text-gray-400">{suffix}</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{description}</p>
            </div>
        </div>
    );
}
