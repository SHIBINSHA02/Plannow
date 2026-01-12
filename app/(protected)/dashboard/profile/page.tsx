"use client";

import { useEffect, useState } from "react";
import { Camera, Building2, Mail, ShieldCheck, X } from "lucide-react";

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
};

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Edit States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then((data) => {
                setData(data);
                setTempImageUrl(data.user.imageUrl || "");
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: tempImageUrl }),
            });

            if (res.ok && data) {
                setData({
                    ...data,
                    user: { ...data.user, imageUrl: tempImageUrl },
                });
                setIsModalOpen(false);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10 animate-pulse text-gray-400 font-medium">Loading profile...</div>;
    if (error) return <div className="max-w-2xl mx-auto mt-10 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>;
    if (!data) return null;

    const { user, organisations } = data;

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-12 px-4">

            {/* --- Profile Header Card --- */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-300" />

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col sm:flex-row items-end gap-5">
                        <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-xl">
                                {user.imageUrl ? (
                                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-demibold text-indigo-300">
                                        {user.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl text-white">
                                <Camera className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="flex-1 mb-2">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {user.name.toUpperCase()}
                            </h1>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
                                <span className="flex items-center gap-1.5 text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Organisations Section --- */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-800">Organisations</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                        {organisations.length} Total
                    </span>
                </div>

                <div className="p-6">
                    {organisations.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-gray-400 text-sm">No organisations linked to this profile.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {organisations.map((org) => (
                                <div key={org._id} className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{org.name}</p>
                                            <p className="text-xs text-gray-400 font-mono tracking-tighter">ID: {org.organisationId}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Image Update Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Update Profile Image</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    autoFocus
                                    type="url"
                                    placeholder="https://images.com/your-avatar.png"
                                    value={tempImageUrl}
                                    onChange={(e) => setTempImageUrl(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Preview */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                                    {tempImageUrl && <img src={tempImageUrl} alt="Preview" className="w-full h-full object-cover" />}
                                </div>
                                <p className="text-xs text-gray-500 italic truncate">Live preview of your new image</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-6 bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}