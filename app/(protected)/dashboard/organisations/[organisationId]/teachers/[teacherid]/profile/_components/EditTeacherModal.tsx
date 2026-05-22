"use client";

import { useState } from "react";
import { updateTeacherAction } from "./actions";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Trash2 } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export default function EditTeacherModal({
    teacher,
    organisationId,
}: {
    teacher: any;
    organisationId: string;
}) {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const [formData, setFormData] = useState({
        teacherName: teacher.teacherName || "",
        email: teacher.email || "",
        subjects: teacher.subjects?.join(", ") || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await updateTeacherAction(
            organisationId,
            teacher.teacherId,
            formData
        );

        setLoading(false);

        if (res?.success) {
            setIsOpen(false);
            if (res.newTeacherId !== teacher.teacherId) {
                router.push(
                    `/dashboard/organisations/${organisationId}/teachers/${res.newTeacherId}/profile`
                );
            } else {
                router.refresh();
            }
        } else {
            setError(res?.error || "Failed to update teacher");
        }
    };

    const handleDeleteTeacher = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
        if (!confirmDelete) return;

        setIsDeleting(true);
        setError("");

        try {
            const res = await fetch(`/api/teachers/${teacher.teacherId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete teacher");
            }

            setIsOpen(false);
            router.push(`/dashboard/organisations/${organisationId}/teachers`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while deleting.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border shadow-sm font-medium transition-colors duration-300
                ${theme === "light"
                        ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        : "bg-[#16223f] border-gray-800 text-gray-200 hover:bg-[#1d2d54]"}
            `}
            >
                <Pencil className="w-4 h-4" />
                Edit Profile
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className={`rounded-xl shadow-xl border w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 transition-colors duration-300
                ${theme === "light"
                        ? "bg-white border-gray-200"
                        : "bg-[#0d1527] border-gray-800"}
            `}
            >
                {/* Header */}
                <div
                    className={`flex justify-between items-center px-6 py-4 border-b transition-colors duration-300
                    ${theme === "light" ? "border-gray-100" : "border-gray-800/60"}
                `}
                >
                    <h3
                        className={`text-lg font-semibold transition-colors duration-300
                        ${theme === "light" ? "text-gray-900" : "text-gray-100"}
                    `}
                    >
                        Edit Teacher Profile
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className={`transition-colors ${theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"}`}
                        disabled={loading || isDeleting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div
                            className={`p-3 rounded-lg text-sm border transition-colors duration-300
                            ${theme === "light"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-red-950/20 text-red-400 border-red-900/40"}
                        `}
                        >
                            {error}
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium transition-colors duration-300 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Name
                        </label>
                        <input
                            required
                            type="text"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            className={`w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 duration-300
                            ${theme === "light"
                                    ? "border border-gray-300 bg-white text-gray-900"
                                    : "border border-gray-800 bg-[#090f1c] text-gray-100 focus:bg-[#0d1527]"}
                        `}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium transition-colors duration-300 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Email
                        </label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            className={`w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 duration-300
                            ${theme === "light"
                                    ? "border border-gray-300 bg-white text-gray-900"
                                    : "border border-gray-800 bg-[#090f1c] text-gray-100 focus:bg-[#0d1527]"}
                        `}
                        />
                    </div>

                    {/* Subjects Input */}
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium transition-colors duration-300 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Subjects
                        </label>
                        <input
                            type="text"
                            name="subjects"
                            value={formData.subjects}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            placeholder="Math, English, Science"
                            className={`w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 duration-300
                            ${theme === "light"
                                    ? "border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                                    : "border border-gray-800 bg-[#090f1c] text-gray-100 placeholder-gray-600 focus:bg-[#0d1527]"}
                        `}
                        />
                        <p className={`text-xs transition-colors duration-300 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                            Separate subjects with commas.
                        </p>
                    </div>

                    {/* Action Buttons Footer */}
                    <div
                        className={`flex justify-between items-center pt-4 border-t gap-3 transition-colors duration-300
                        ${theme === "light" ? "border-gray-100" : "border-gray-800/60"}
                    `}
                    >
                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={handleDeleteTeacher}
                            disabled={loading || isDeleting}
                            className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 duration-300
                            ${theme === "light"
                                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                    : "bg-red-950/20 text-red-400 border-red-900/40 hover:bg-red-950/40"}
                        `}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </button>

                        {/* Cancel / Save Group */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={loading || isDeleting}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 duration-300
                                ${theme === "light"
                                        ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                        : "bg-transparent border-gray-800 text-gray-300 hover:bg-[#16223f]"}
                            `}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isDeleting}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[110px] disabled:opacity-50 duration-300
                                ${theme === "light"
                                        ? "bg-gray-900 text-white hover:bg-gray-800"
                                        : "bg-blue-600 text-white hover:bg-blue-500"}
                            `}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}