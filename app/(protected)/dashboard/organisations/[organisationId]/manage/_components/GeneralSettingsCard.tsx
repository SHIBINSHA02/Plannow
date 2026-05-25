// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/GeneralSettingsCard.tsx
// app/(protected)/dashboard/organisations/[organisationId]/manage/components/GeneralSettingsCard.tsx

"use client";

import { Save, Settings } from "lucide-react";

interface ThemeClasses {
    cardBase: string;
    textColor: string;
    subTextColor: string;
    inputBase: string;
}

interface Props {
    organisationName: string;
    setOrganisationName: (value: string) => void;

    workingDays: number;
    setWorkingDays: (value: number) => void;

    periodsPerDay: number;
    setPeriodsPerDay: (value: number) => void;

    allowParallel: boolean;
    setAllowParallel: React.Dispatch<React.SetStateAction<boolean>>;

    profileUrl: string;
    setProfileUrl: (value: string) => void;

    bgUrl: string;
    setBgUrl: (value: string) => void;

    handleSave: () => void;

    saving: boolean;
    isDirty: boolean;
    canEdit: boolean;

    theme: string;
    themeClasses: ThemeClasses;
}

export default function GeneralSettingsCard({
    organisationName,
    setOrganisationName,

    workingDays,
    setWorkingDays,

    periodsPerDay,
    setPeriodsPerDay,

    allowParallel,
    setAllowParallel,

    profileUrl,
    setProfileUrl,

    bgUrl,
    setBgUrl,

    handleSave,

    saving,
    isDirty,
    canEdit,

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
                className={`flex items-center gap-2 text-xl font-bold mb-6 ${textColor}`}
            >
                <Settings
                    size={20}
                    className="text-blue-500"
                />
                General Settings
            </h3>

            <div className="space-y-5 max-w-xl">
                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${textColor}`}
                    >
                        Organisation Name
                    </label>

                    <input
                        type="text"
                        className={inputBase}
                        placeholder="Enter name..."
                        value={organisationName}
                        onChange={(e) =>
                            setOrganisationName(
                                e.target.value
                            )
                        }
                        disabled={!canEdit}
                    />
                </div>

                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${textColor}`}
                    >
                        Working days per week
                    </label>

                    <input
                        type="number"
                        min={1}
                        max={7}
                        className={inputBase}
                        value={workingDays}
                        onChange={(e) =>
                            setWorkingDays(
                                Number(e.target.value)
                            )
                        }
                        disabled={!canEdit}
                    />
                </div>

                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${textColor}`}
                    >
                        Periods per day
                    </label>

                    <input
                        type="number"
                        min={1}
                        max={20}
                        className={inputBase}
                        value={periodsPerDay}
                        onChange={(e) =>
                            setPeriodsPerDay(
                                Number(e.target.value)
                            )
                        }
                        disabled={!canEdit}
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div
                            className={`text-sm font-medium ${textColor}`}
                        >
                            Enable parallel assignments
                        </div>

                        <div
                            className={`text-sm ${subTextColor}`}
                        >
                            Allow multiple assignments at
                            once
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            setAllowParallel((v) => !v)
                        }
                        disabled={!canEdit}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 border
                            ${
                                allowParallel
                                    ? theme === "light"
                                        ? "bg-blue-600 border-blue-600"
                                        : "bg-blue-500 border-blue-500"
                                    : theme === "light"
                                    ? "bg-white border-gray-300"
                                    : "bg-slate-800 border-slate-700"
                            }
                            ${
                                !canEdit
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                            }`}
                    >
                        <div
                            className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 bg-white
                                ${
                                    allowParallel
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>

                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${textColor}`}
                    >
                        Profile image URL (optional)
                    </label>

                    <input
                        type="url"
                        className={inputBase}
                        placeholder="https://..."
                        value={profileUrl}
                        onChange={(e) =>
                            setProfileUrl(
                                e.target.value
                            )
                        }
                        disabled={!canEdit}
                    />
                </div>

                <div>
                    <label
                        className={`block text-sm font-medium mb-1.5 ${textColor}`}
                    >
                        Background image URL (optional)
                    </label>

                    <input
                        type="url"
                        className={inputBase}
                        placeholder="https://..."
                        value={bgUrl}
                        onChange={(e) =>
                            setBgUrl(e.target.value)
                        }
                        disabled={!canEdit}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={
                        !canEdit ||
                        saving ||
                        !isDirty
                    }
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Save size={16} />

                    {saving
                        ? "Saving..."
                        : isDirty
                        ? "Save Changes"
                        : "Saved"}
                </button>

                {!canEdit ? (
                    <p
                        className={`text-sm ${subTextColor}`}
                    >
                        You have view access only. Ask your
                        admin for editor permissions to make
                        changes.
                    </p>
                ) : null}
            </div>
        </div>
    );
}