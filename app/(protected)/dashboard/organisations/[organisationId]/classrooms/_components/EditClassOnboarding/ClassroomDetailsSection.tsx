import { useTheme } from "@/app/theme-provider";

type Props = {
    className: string;
    setClassName: (value: string) => void;
    department: string;
    setDepartment: (value: string) => void;
    adminEmail: string;
    setAdminEmail: (value: string) => void;
    error: string | null;
    successMsg: string | null;
};

const inputClass = (theme: string) =>
    `w-full p-2 border rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        ${theme === "light"
            ? "border-gray-200 bg-white text-gray-900"
            : "border-slate-800 bg-slate-900 text-slate-100"}`;

export default function ClassroomDetailsSection({
    className,
    setClassName,
    department,
    setDepartment,
    adminEmail,
    setAdminEmail,
    error,
    successMsg,
}: Props) {
    const { theme } = useTheme();

    return (
        <>
            <div className="mb-4">
                <h2 className="font-medium text-xl text-blue-600 mb-4">Classroom Details</h2>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-slate-400"}`}>
                    Update the class name, department, or subjects.
                </p>
            </div>

            {error && (
                <p className={`p-2 rounded-xl font-medium text-sm border
                    ${theme === "light"
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-red-950/40 border-red-900/30 text-red-400"}`}
                >
                    {error}
                </p>
            )}

            {successMsg && (
                <p className={`p-2 rounded-xl font-medium text-sm border
                    ${theme === "light"
                        ? "bg-green-50 border-green-100 text-green-700"
                        : "bg-green-950/40 border-green-900/30 text-green-400"}`}
                >
                    {successMsg}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                        Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        placeholder="Classroom Name"
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                        className={inputClass(theme)}
                        required
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                        Department
                    </label>
                    <input
                        placeholder="Department"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className={inputClass(theme)}
                    />
                </div>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                    Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="admin@school.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className={inputClass(theme)}
                    required
                />
            </div>

            <div className={`border-b my-10 ${theme === "light" ? "border-blue-800" : "border-slate-700"}`} />
        </>
    );
}
