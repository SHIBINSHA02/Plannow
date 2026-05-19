"use client";

import React, { useState } from "react";

// Define the interface for props passed down from the parent
interface LinkModelProps {
    organisationId: string;
    type: "TEACHER" | "CLASSROOM";
    onClose: () => void;
}

export const LinkModel: React.FC<LinkModelProps> = ({
    organisationId,
    type,
    onClose,
}) => {
    // 1. Core States migrated inside
    const [linkTimer, setLinkTimer] = useState("24");
    const [linkInstructions, setLinkInstructions] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);

    // 2. Localized API Request Logic 
    const handleGenerateLink = async () => {
        if (!type) return;
        setGeneratingLink(true);
        try {
            const res = await fetch(`/api/organisation/${organisationId}/onboarding-tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type,
                    expiresInHours: parseInt(linkTimer) || 24,
                    instructions: linkInstructions,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to generate link");

            const baseUrl = window.location.origin;
            const link = `${baseUrl}/onboarding/${data.token.tokenId}`;
            setGeneratedLink(link);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "An error occurred");
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleClose = () => {
        // Reset states before closing
        setGeneratedLink("");
        setLinkInstructions("");
        setLinkTimer("24");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold">
                    Generate {type === "TEACHER" ? "Teacher" : "Classroom"} Link
                </h2>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Valid for (in hours)</label>
                    <input
                        type="number"
                        value={linkTimer}
                        onChange={(e) => setLinkTimer(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="24"
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Custom Instructions</label>
                    <textarea
                        value={linkInstructions}
                        onChange={(e) => setLinkInstructions(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                        placeholder="Add any specific instructions here..."
                    />
                </div>

                {generatedLink && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm break-all font-mono text-gray-800">
                        {generatedLink}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Close
                    </button>

                    {!generatedLink ? (
                        <button
                            disabled={generatingLink}
                            onClick={handleGenerateLink}
                            className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                        >
                            {generatingLink ? "Generating..." : "Generate"}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedLink);
                                alert("Link copied!");
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                        >
                            Copy Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};