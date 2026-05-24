// app/(protected)/dashboard/organisations/[organisationId]/manage/_components/theme.ts
// app/(protected)/dashboard/organisations/[organisationId]/manage/theme.ts

export const getThemeClasses = (theme: string) => {
    return {
        cardBase: `p-6 rounded-2xl shadow-sm border ${
            theme === "light"
                ? "bg-white border-gray-200"
                : "bg-[#0f172a] border-slate-800"
        }`,

        textColor:
            theme === "light"
                ? "text-gray-900"
                : "text-white",

        subTextColor:
            theme === "light"
                ? "text-gray-500"
                : "text-slate-400",

        inputBase: `w-full px-3 py-2 border rounded-lg outline-none transition ${
            theme === "light"
                ? "bg-white border-gray-300 focus:border-blue-500"
                : "bg-[#0f172a] border-slate-700 focus:border-blue-500 text-white"
        }`,
    };
};