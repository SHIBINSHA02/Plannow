"use client"
import Sidebar from "../_component/SideMenu";
import { useTheme } from "@/app/theme-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useTheme();

    return (
        <div
            className={`flex lg:flex-row flex-col min-h-screen transition-colors duration-300
            ${theme === "light"
                    ? "bg-gray-50"
                    : "bg-[#020817]"}
        `}
        >
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main
                className={`flex-1 p-6 overflow-y-auto transition-colors duration-300
                ${theme === "light"
                        ? "bg-gray-50 text-black"
                        : "bg-[#020817] text-white"}
            `}
            >
                {children}
            </main>
        </div>
    );
}