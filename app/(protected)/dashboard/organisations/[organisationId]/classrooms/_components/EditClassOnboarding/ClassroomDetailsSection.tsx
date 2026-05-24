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
    return (
        <>
            <div className="mb-4">
                <h2 className="font-medium text-xl text-blue-700 mb-4">Classroom Details</h2>
                <p className="text-sm text-gray-500">Update the class name, department, or subjects.</p>
            </div>

            {error && (
                <p className="p-2 bg-red-100 text-red-700 rounded-xl">{error}</p>
            )}

            {successMsg && (
                <p className="p-2 bg-green-100 text-green-700 rounded-xl">{successMsg}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                        Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        placeholder="Classroom Name"
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                        Department
                    </label>
                    <input
                        placeholder="Department"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                    Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    placeholder="admin@school.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                    required
                />
            </div>

            <div className="border-b my-10 border-blue-800" />
        </>
    );
}
