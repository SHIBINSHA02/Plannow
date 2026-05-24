// app/(protected)/dashboard/organisations/[organisationId]/_components/windows/LinkModel.tsx
"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/theme-provider";

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
  const [linkTimer, setLinkTimer] = useState("24");
  const [linkInstructions, setLinkInstructions] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  const { theme } = useTheme();

  const isDark = theme === "dark";

  const handleGenerateLink = async () => {
    if (!type) return;

    setGeneratingLink(true);

    try {
      const res = await fetch(
        `/api/organisation/${organisationId}/onboarding-tokens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            expiresInHours: parseInt(linkTimer) || 24,
            instructions: linkInstructions,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate link");
      }

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
    setGeneratedLink("");
    setLinkInstructions("");
    setLinkTimer("24");
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
        isDark ? "bg-slate-950/80" : "bg-black/40"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl transition-all ${
          isDark
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Generate{" "}
              {type === "TEACHER" ? "Teacher" : "Classroom"} Link
            </h2>

            <p
              className={`mt-1 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Create a secure onboarding invitation link
            </p>
          </div>

          <button
            onClick={handleClose}
            className={`rounded-lg px-3 py-1 text-sm transition ${
              isDark
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 px-6 py-5">
          {/* Timer */}
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              Valid for (hours)
            </label>

            <input
              type="number"
              min="1"
              value={linkTimer}
              onChange={(e) => setLinkTimer(e.target.value)}
              placeholder="24"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Instructions */}
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              Custom Instructions
            </label>

            <textarea
              rows={4}
              value={linkInstructions}
              onChange={(e) => setLinkInstructions(e.target.value)}
              placeholder="Add onboarding instructions..."
              className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <div
              className={`rounded-xl border p-4 text-sm break-all font-mono ${
                isDark
                  ? "border-blue-900 bg-slate-800 text-blue-300"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {generatedLink}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end gap-3 border-t px-6 py-4 ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <button
            onClick={handleClose}
            className={`rounded-xl px-5 py-2.5 font-medium transition ${
              isDark
                ? "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>

          {!generatedLink ? (
            <button
              disabled={generatingLink}
              onClick={handleGenerateLink}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingLink ? "Generating..." : "Generate Link"}
            </button>
          ) : (
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Link copied!");
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Copy Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
};