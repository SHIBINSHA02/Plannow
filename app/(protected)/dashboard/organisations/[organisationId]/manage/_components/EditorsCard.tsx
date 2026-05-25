// app/(protected)/dashboard/organisations/[organisationId]/manage/components/EditorsCard.tsx

"use client";

import { Plus, Save, Users, X } from "lucide-react";

interface ThemeClasses {
    cardBase: string;
    textColor: string;
    subTextColor: string;
    inputBase: string;
}

interface Props {
    editors: string[];

    newEditorEmail: string;
    setNewEditorEmail: (value: string) => void;

    handleAddEditor: () => void;
    handleRemoveEditor: (email: string) => void;

    handleSave: () => void;

    saving: boolean;
    isDirty: boolean;

    canEdit: boolean;
    isAdmin: boolean;

    theme: string;
    themeClasses: ThemeClasses;
}

export default function EditorsCard({
    editors,

    newEditorEmail,
    setNewEditorEmail,

    handleAddEditor,
    handleRemoveEditor,

    handleSave,

    saving,
    isDirty,

    canEdit,
    isAdmin,

    theme,
    themeClasses,
}: Props) {
    const {
        cardBase,
        textColor,
        subTextColor,
        inputBase,
    } = themeClasses;

    return (
        <div className={cardBase}>
            <h3
                className={`flex items-center gap-2 text-xl font-bold mb-2 ${textColor}`}
            >
                <Users
                    size={20}
                    className="text-purple-500"
                />
                Editors (Admin only)
            </h3>

            <p
                className={`text-sm mb-6 ${subTextColor}`}
            >
                Editors can manage this organisation.
                Only the admin can change the list.
            </p>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="email"
                        className={inputBase}
                        placeholder="editor@example.com"
                        value={newEditorEmail}
                        onChange={(e) =>
                            setNewEditorEmail(
                                e.target.value
                            )
                        }
                        disabled={
                            !canEdit || !isAdmin
                        }
                    />

                    <button
                        onClick={handleAddEditor}
                        disabled={
                            !canEdit ||
                            !isAdmin ||
                            !newEditorEmail.trim()
                        }
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                {editors.length === 0 ? (
                    <div
                        className={`text-sm ${subTextColor}`}
                    >
                        No editors added.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {editors.map((email) => (
                            <div
                                key={email}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
                                ${
                                    theme === "light"
                                        ? "bg-gray-50 border-gray-200 text-gray-700"
                                        : "bg-slate-900 border-slate-800 text-slate-200"
                                }`}
                            >
                                <span className="truncate max-w-[260px]">
                                    {email}
                                </span>

                                <button
                                    onClick={() =>
                                        handleRemoveEditor(
                                            email
                                        )
                                    }
                                    disabled={
                                        !canEdit ||
                                        !isAdmin
                                    }
                                    className={`p-1 rounded-lg transition ${
                                        theme === "light"
                                            ? "hover:bg-gray-200"
                                            : "hover:bg-slate-800"
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={
                        !canEdit ||
                        !isAdmin ||
                        saving ||
                        !isDirty
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition disabled:opacity-60 disabled:cursor-not-allowed
                    border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                    <Save size={16} />
                    Save editor changes
                </button>

                {!isAdmin ? (
                    <p
                        className={`text-sm ${subTextColor}`}
                    >
                        You’re an editor. Only the admin can
                        add/remove editors.
                    </p>
                ) : null}
            </div>
        </div>
    );
}