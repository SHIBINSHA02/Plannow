"use client";

import { useEffect, useState } from "react";

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

    const [imageUrl, setImageUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then(data => {
                setData(data);
                setImageUrl(data.user.imageUrl || "");
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const saveImage = async () => {
        setSaving(true);
        setSuccess(false);

        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
        });

        setSaving(false);

        if (res.ok && data) {
            setData({
                ...data,
                user: {
                    ...data.user,
                    imageUrl,
                },
            });
            setSuccess(true);
        }
    };

    if (loading) return <p>Loading profile…</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data) return null;

    const { user, organisations } = data;

    return (
        <div className="max-w-4xl space-y-8">
            {/* Profile Card */}
            <div className="flex items-center gap-5 bg-white p-6 rounded-xl shadow">
                {user.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
                        {user.name?.[0] ?? "U"}
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-xs mt-1 text-indigo-600">
                        Role: {user.role}
                    </p>
                </div>
            </div>

            {/* Edit Profile Image */}
            <div className="bg-white p-6 rounded-xl shadow space-y-3">
                <h3 className="text-lg font-semibold">Update Profile Image</h3>

                <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full p-2 border rounded"
                />

                <button
                    onClick={saveImage}
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                    {saving ? "Saving..." : "Save Image"}
                </button>

                {success && (
                    <p className="text-sm text-green-600">
                        Profile image updated successfully
                    </p>
                )}
            </div>

            {/* Organisations */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-lg font-semibold mb-4">
                    Organisations you work with
                </h3>

                {organisations.length === 0 ? (
                    <p className="text-gray-400">
                        You are not part of any organisation yet
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {organisations.map(org => (
                            <li
                                key={org._id}
                                className="p-3 border rounded flex justify-between items-center"
                            >
                                <span>{org.name}</span>
                                <span className="text-xs text-gray-400">
                                    {org.organisationId}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
