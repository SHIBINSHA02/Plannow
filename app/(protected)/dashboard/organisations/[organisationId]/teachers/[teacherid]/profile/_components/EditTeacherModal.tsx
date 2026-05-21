"use client";

import { useState } from "react";
import { updateTeacherAction } from "./actions";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Trash2 } from "lucide-react";

export default function EditTeacherModal({
    teacher,
    organisationId,
}: {
    teacher: any;
    organisationId: string;
}) {
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
            // Redirect the user back to the teachers list view after deletion
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
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
                <Pencil className="w-4 h-4" />
                Edit Profile
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Edit Teacher Profile
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading || isDeleting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            required
                            type="text"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Subjects</label>
                        <input
                            type="text"
                            name="subjects"
                            value={formData.subjects}
                            onChange={handleChange}
                            disabled={loading || isDeleting}
                            placeholder="Math, English, Science"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500">
                            Separate subjects with commas.
                        </p>
                    </div>

                    {/* Action Buttons Container */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 gap-3">
                        {/* Delete Button (Left Aligned) */}
                        <button
                            type="button"
                            onClick={handleDeleteTeacher}
                            disabled={loading || isDeleting}
                            className="px-4 py-2 flex items-center gap-2 border border-red-200 rounded-lg text-sm bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </button>

                        {/* Cancel / Save Buttons (Right Aligned) */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={loading || isDeleting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isDeleting}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}