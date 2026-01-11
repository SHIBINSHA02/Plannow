"use client";

import { useState } from "react";

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

    if (!open) return null;

    const submit = async () => {
        setLoading(true);

        const res = await fetch("/api/organisation/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organisationName: name }),
        });

        setLoading(false);

        if (res.ok) {
            onClose();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-96">
                <h2 className="text-lg font-semibold mb-4">
                    Create Organisation
                </h2>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                    placeholder="Organisation name"
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded"
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}
