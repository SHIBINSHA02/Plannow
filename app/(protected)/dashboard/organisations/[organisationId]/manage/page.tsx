"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/theme-provider";
import {
    ArrowLeft,
    Save,
    Trash2,
    Settings,
    AlertTriangle,
    FolderKanban,
    ShieldCheck,
    Users,
    Plus,
    X,
    Loader2,
} from "lucide-react";

type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    editors: string[];
    workingDays: number;
    periodsPerDay: number;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

type OrganisationResponse = {
    organisation: Organisation;
    canEdit: boolean;
    isAdmin?: boolean;
};

export default function ManageOrganisationPage() {
    const { theme } = useTheme();
    const { organisationId } = useParams();
    const router = useRouter();
    const orgId = organisationId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [organisation, setOrganisation] = useState<Organisation | null>(null);

    // Form state
    const [organisationName, setOrganisationName] = useState("");
    const [workingDays, setWorkingDays] = useState<number>(5);
    const [periodsPerDay, setPeriodsPerDay] = useState<number>(6);
    const [allowParallel, setAllowParallel] = useState(false);
    const [profileUrl, setProfileUrl] = useState("");
    const [bgUrl, setBgUrl] = useState("");

    // Editors state (admin-only edits on server)
    const [editors, setEditors] = useState<string[]>([]);
    const [newEditorEmail, setNewEditorEmail] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");

    /* ---------- Theme Helpers (Matching your Schedule Page) ---------- */
    const cardBase = `p-6 rounded-2xl shadow-sm border ${theme === "light" ? "bg-white border-gray-200" : "bg-[#0f172a] border-slate-800"
        }`;
    const textColor = theme === "light" ? "text-gray-900" : "text-white";
    const subTextColor = theme === "light" ? "text-gray-500" : "text-slate-400";
    const inputBase = `w-full px-3 py-2 border rounded-lg outline-none transition ${theme === "light"
            ? "bg-white border-gray-300 focus:border-blue-500"
            : "bg-[#0f172a] border-slate-700 focus:border-blue-500 text-white"
        }`;

    const isDirty = useMemo(() => {
        if (!organisation) return false;
        return (
            organisationName !== organisation.organisationName ||
            workingDays !== organisation.workingDays ||
            periodsPerDay !== organisation.periodsPerDay ||
            (allowParallel ?? false) !== (organisation.allowParallelAssignments ?? false) ||
            (profileUrl || "") !== (organisation.profileImageUrl ?? "") ||
            (bgUrl || "") !== (organisation.backgroundImageUrl ?? "") ||
            JSON.stringify(editors.slice().sort()) !== JSON.stringify((organisation.editors ?? []).slice().sort())
        );
    }, [
        organisation,
        organisationName,
        workingDays,
        periodsPerDay,
        allowParallel,
        profileUrl,
        bgUrl,
        editors,
    ]);

    useEffect(() => {
        if (!orgId) return;

        const fetchOrg = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/organisation/${orgId}`, { cache: "no-store" });
                if (!res.ok) {
                    router.replace("/unauthorized");
                    return;
                }
                const data: OrganisationResponse = await res.json();
                setOrganisation(data.organisation);
                setCanEdit(data.canEdit);
                setIsAdmin(Boolean(data.isAdmin));

                setOrganisationName(data.organisation.organisationName ?? "");
                setWorkingDays(data.organisation.workingDays ?? 5);
                setPeriodsPerDay(data.organisation.periodsPerDay ?? 6);
                setAllowParallel(Boolean(data.organisation.allowParallelAssignments));
                setProfileUrl(data.organisation.profileImageUrl ?? "");
                setBgUrl(data.organisation.backgroundImageUrl ?? "");
                setEditors(Array.isArray(data.organisation.editors) ? data.organisation.editors : []);
            } catch (e: any) {
                setError(e?.message || "Failed to load organisation");
            } finally {
                setLoading(false);
            }
        };

        fetchOrg();
    }, [orgId, router]);

    const handleSave = async () => {
        if (!canEdit || !orgId) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/organisation/${orgId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organisationName: organisationName.trim(),
                    workingDays,
                    periodsPerDay,
                    allowParallelAssignments: allowParallel,
                    profileImageUrl: profileUrl.trim() || null,
                    backgroundImageUrl: bgUrl.trim() || null,
                    ...(isAdmin ? { editors } : {}),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                alert(data?.message || "Failed to save changes");
                return;
            }

            const data: OrganisationResponse = await res.json();
            setOrganisation(data.organisation);
            setCanEdit(data.canEdit);
            setIsAdmin(Boolean(data.isAdmin));
        } catch (e: any) {
            setError(e?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const normalizeEmail = (email: string) => email.trim().toLowerCase();

    const handleAddEditor = () => {
        if (!isAdmin) return;
        const email = normalizeEmail(newEditorEmail);
        if (!email) return;
        if (organisation?.adminName && normalizeEmail(organisation.adminName) === email) {
            setNewEditorEmail("");
            return;
        }
        if (editors.map(normalizeEmail).includes(email)) {
            setNewEditorEmail("");
            return;
        }
        setEditors((prev) => [...prev, email]);
        setNewEditorEmail("");
    };

    const handleRemoveEditor = (email: string) => {
        if (!isAdmin) return;
        const target = normalizeEmail(email);
        setEditors((prev) => prev.filter((e) => normalizeEmail(e) !== target));
    };

    const handleDeleteOrganisation = async () => {
        if (!orgId) return;
        if (!isAdmin) {
            alert("Only the organisation admin can delete it.");
            return;
        }
        if (deleteConfirm !== orgId) {
            alert("Type the organisation ID exactly to confirm deletion.");
            return;
        }
        const ok = confirm(
            "This will permanently delete the organisation and all associated data. This action cannot be undone. Continue?"
        );
        if (!ok) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/organisation/${orgId}`, { method: "DELETE" });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                alert(data?.message || "Failed to delete organisation");
                return;
            }
            router.replace("/dashboard/organisations");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl lg:mx-auto lg:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className={`p-2 rounded-lg border transition ${theme === "light" ? "border-gray-200 hover:bg-gray-100" : "border-slate-800 hover:bg-slate-800"}`}
                >
                    <ArrowLeft size={20} className={textColor} />
                </button>
                <div>
                    <h1 className={`text-2xl font-bold ${textColor}`}>Manage Organisation</h1>
                    <p className={`text-sm ${subTextColor}`}>ID: {orgId}</p>
                </div>
            </div>

            {loading ? (
                <div className={`${cardBase} flex items-center gap-3 ${subTextColor}`}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading organisation settings...
                </div>
            ) : error ? (
                <div className={`${cardBase} text-sm ${theme === "light" ? "text-red-600" : "text-red-400"}`}>
                    {error}
                </div>
            ) : null}

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-3">
                <button
                    onClick={() => router.push(`/dashboard/organisations/${orgId}`)}
                    className={`${cardBase} text-left hover:shadow-md transition`}
                >
                    <div className="flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-blue-500" />
                        <div>
                            <div className={`font-semibold ${textColor}`}>Organisation Dashboard</div>
                            <div className={`text-sm ${subTextColor}`}>Teachers, classrooms, submissions</div>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push(`/dashboard/organisations/${orgId}/verify`)}
                    className={`${cardBase} text-left hover:shadow-md transition`}
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <div>
                            <div className={`font-semibold ${textColor}`}>Verification & Onboarding</div>
                            <div className={`text-sm ${subTextColor}`}>Approve submissions, manage links</div>
                        </div>
                    </div>
                </button>

                <div className={`${cardBase}`}>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        <div>
                            <div className={`font-semibold ${textColor}`}>Access</div>
                            <div className={`text-sm ${subTextColor}`}>Manage editor emails below</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Settings Card */}
            <div className={cardBase}>
                <h3 className={`flex items-center gap-2 text-xl font-bold mb-6 ${textColor}`}>
                    <Settings size={20} className="text-blue-500" />
                    General Settings
                </h3>

                <div className="space-y-5 max-w-xl">
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Organisation Name</label>
                        <input
                            type="text"
                            className={inputBase}
                            placeholder="Enter name..."
                            value={organisationName}
                            onChange={(e) => setOrganisationName(e.target.value)}
                            disabled={!canEdit}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Working days per week</label>
                        <input
                            type="number"
                            min={1}
                            max={7}
                            className={inputBase}
                            value={workingDays}
                            onChange={(e) => setWorkingDays(Number(e.target.value))}
                            disabled={!canEdit}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Periods per day</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            className={inputBase}
                            value={periodsPerDay}
                            onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className={`text-sm font-medium ${textColor}`}>Enable parallel assignments</div>
                            <div className={`text-sm ${subTextColor}`}>Allow multiple assignments at once</div>
                        </div>
                        <button
                            onClick={() => setAllowParallel((v) => !v)}
                            disabled={!canEdit}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 border
                                ${allowParallel
                                    ? (theme === "light" ? "bg-blue-600 border-blue-600" : "bg-blue-500 border-blue-500")
                                    : (theme === "light" ? "bg-white border-gray-300" : "bg-slate-800 border-slate-700")
                                }
                                ${!canEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 bg-white
                                    ${allowParallel ? "translate-x-6" : "translate-x-0"}`}
                            />
                        </button>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Profile image URL (optional)</label>
                        <input
                            type="url"
                            className={inputBase}
                            placeholder="https://..."
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            disabled={!canEdit}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Background image URL (optional)</label>
                        <input
                            type="url"
                            className={inputBase}
                            placeholder="https://..."
                            value={bgUrl}
                            onChange={(e) => setBgUrl(e.target.value)}
                            disabled={!canEdit}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!canEdit || saving || !isDirty}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
                    </button>
                    {!canEdit ? (
                        <p className={`text-sm ${subTextColor}`}>
                            You have view access only. Ask your admin for editor permissions to make changes.
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Editors / Access */}
            <div className={cardBase}>
                <h3 className={`flex items-center gap-2 text-xl font-bold mb-2 ${textColor}`}>
                    <Users size={20} className="text-purple-500" />
                    Editors (Admin only)
                </h3>
                <p className={`text-sm mb-6 ${subTextColor}`}>
                    Editors can manage this organisation. Only the admin can change the list.
                </p>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="email"
                            className={inputBase}
                            placeholder="editor@example.com"
                            value={newEditorEmail}
                            onChange={(e) => setNewEditorEmail(e.target.value)}
                            disabled={!canEdit || !isAdmin}
                        />
                        <button
                            onClick={handleAddEditor}
                            disabled={!canEdit || !isAdmin || !newEditorEmail.trim()}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>

                    {editors.length === 0 ? (
                        <div className={`text-sm ${subTextColor}`}>No editors added.</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {editors.map((email) => (
                                <div
                                    key={email}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
                                        ${theme === "light" ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-slate-900 border-slate-800 text-slate-200"}`}
                                >
                                    <span className="truncate max-w-[260px]">{email}</span>
                                    <button
                                        onClick={() => handleRemoveEditor(email)}
                                        disabled={!canEdit || !isAdmin}
                                        className={`p-1 rounded-lg transition ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-800"} disabled:opacity-60 disabled:cursor-not-allowed`}
                                        title="Remove editor"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={!canEdit || !isAdmin || saving || !isDirty}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition disabled:opacity-60 disabled:cursor-not-allowed
                            border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                        <Save size={16} />
                        Save editor changes
                    </button>
                    {!isAdmin ? (
                        <p className={`text-sm ${subTextColor}`}>
                            You’re an editor. Only the admin can add/remove editors.
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Danger Zone */}
            <div className={`p-6 rounded-2xl border ${theme === "light" ? "bg-red-50/50 border-red-200" : "bg-red-950/10 border-red-900/50"}`}>
                <h3 className="flex items-center gap-2 text-red-600 font-bold mb-2">
                    <AlertTriangle size={18} />
                    Danger Zone
                </h3>
                <p className={`text-sm mb-4 ${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                    Permanently delete this organisation and all its associated data. This action cannot be undone.
                </p>
                <div className="space-y-3 max-w-xl">
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                            Type <span className="font-bold">{orgId}</span> to confirm
                        </label>
                        <input
                            type="text"
                            className={`${inputBase} ${theme === "light" ? "border-red-200 focus:border-red-400" : "border-red-900/50 focus:border-red-500"}`}
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleDeleteOrganisation}
                        disabled={!isAdmin || deleting || deleteConfirm !== orgId}
                        className="flex items-center justify-center gap-2 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed
                            bg-red-600 hover:bg-red-700"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                        {deleting ? "Deleting..." : "Delete Organisation"}
                    </button>
                    <p className={`text-xs ${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                        Admin-only. Editors can’t delete organisations.
                    </p>
                </div>
            </div>
        </div>
    );
}