"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
    SignedIn,
    UserButton,
    useUser,
    SignOutButton,
} from "@clerk/nextjs";

import {
    LayoutDashboard,
    Building2,
    GraduationCap,
    Calendar,
    MessageSquare,
    User,
    Menu,
    X,
    Sun,
    Moon,
} from "lucide-react";

import { useTheme } from "@/app/theme-provider";

export default function Sidebar() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    return (
        <>
            {/* ---------- Mobile Top Bar ---------- */}
            <div
                className={`md:hidden flex items-center justify-between h-16 px-4 border-b
                ${theme === "light"
                        ? "border-gray-300 bg-white"
                        : "border-slate-800 bg-[#0f172a]"
                    }`}
            >
                <button onClick={() => setOpen(true)}>
                    <Menu
                        size={24}
                        className={
                            theme === "light"
                                ? "text-black"
                                : "text-white"
                        }
                    />
                </button>

                <Link href="/">
                    <div className="relative">
                        <Image
                            src="/logo.png"
                            alt="App Logo"
                            width={150}
                            height={200}
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>

            {/* ---------- Mobile Overlay ---------- */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* ---------- Sidebar ---------- */}
            <aside
                className={`
                    fixed z-50 top-0 left-0 h-screen w-64
                    transform transition-transform duration-300
                    ${theme === "light"
                        ? "bg-white border-r border-gray-200"
                        : "bg-[#0f172a] border-r border-slate-800"}
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:flex
                    flex-col
                `}
            >
                {/* ---------- Header ---------- */}
                <div className="h-16 px-6 border-b border-gray-300 bg-blue-700 flex items-center justify-between relative overflow-hidden">
                    {/* Noise Texture */}
                    <div
                        className="absolute inset-0 opacity-60 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    <Link href="/">
                        <div className="relative">
                            <Image
                                src="/logo.png"
                                alt="App Logo"
                                width={120}
                                height={120}
                                className="object-contain lg:w-40"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ---------- Profile ---------- */}
                <SignedIn>
                    <div
                        className={`px-6 py-4 flex items-center gap-3 border-b rounded-3xl
                        ${theme === "light"
                                ? "border-gray-300"
                                : "border-slate-800"}
                    `}
                    >
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }}
                            afterSignOutUrl="/"
                        />

                        <div className="flex flex-col leading-tight">
                            <span
                                className={`text-sm font-medium
                                ${theme === "light"
                                        ? "text-gray-900"
                                        : "text-white"}
                            `}
                            >
                                {user?.fullName}
                            </span>

                            <span
                                className={`text-xs truncate max-w-[140px]
                                ${theme === "light"
                                        ? "text-gray-500"
                                        : "text-slate-400"}
                            `}
                            >
                                {user?.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                    </div>
                </SignedIn>

                {/* ---------- Navigation ---------- */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavItem
                        href="/dashboard"
                        icon={<LayoutDashboard size={18} />}
                        label="Overview"
                        theme={theme}
                    />

                    <NavItem
                        href="/dashboard/organisations"
                        icon={<Building2 size={18} />}
                        label="Organisations"
                        theme={theme}
                    />

                    <NavItem
                        href="/dashboard/classrooms"
                        icon={<GraduationCap size={18} />}
                        label="Classrooms"
                        theme={theme}
                    />

                    <NavItem
                        href="/dashboard/schedules"
                        icon={<Calendar size={18} />}
                        label="Schedules"
                        theme={theme}
                    />

                    <NavItem
                        href="/dashboard/substitution"
                        icon={<MessageSquare size={18} />}
                        label="Substitution"
                        theme={theme}
                    />

                    <NavItem
                        href="/dashboard/profile"
                        icon={<User size={18} />}
                        label="Profile"
                        theme={theme}
                    />

                    {/* ---------- Bottom Section ---------- */}
                    <div
                        className={`pt-4 mt-4 border-t space-y-3 flex flex-col justify-between
                        ${theme === "light"
                                ? "border-gray-100"
                                : "border-slate-800"}
                    `}
                    >
                        {/* Theme Toggle */}
                        <div className="w-full flex items-center justify-between px-2 py-1.5">
                            <span
                                className={`text-sm font-medium flex items-center gap-2.5
                                ${theme === "light"
                                        ? "text-slate-600"
                                        : "text-slate-300"}
                            `}
                            >
                                {theme === "light" ? (
                                    <>
                                        <Sun
                                            size={16}
                                            className="text-blue-500 animate-pulse"
                                        />
                                        <span>Light Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Moon
                                            size={16}
                                            className="text-blue-400"
                                        />
                                        <span>Dark Mode</span>
                                    </>
                                )}
                            </span>

                            {/* Toggle Switch */}
                            <button
                                onClick={() =>
                                    setTheme(
                                        theme === "light"
                                            ? "dark"
                                            : "light"
                                    )
                                }
                                className={`
                                    relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
                                    transition-colors duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                    ${theme === "dark"
                                        ? "bg-blue-600"
                                        : "bg-slate-200"}
                                `}
                                role="switch"
                                aria-checked={theme === "dark"}
                            >
                                <span
                                    className={`
                                        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                                        transition duration-200 ease-in-out mt-0.5
                                        ${theme === "dark"
                                            ? "translate-x-4.5"
                                            : "translate-x-0.5"}
                                    `}
                                />
                            </button>
                        </div>

                        {/* Logout */}
                        <SignOutButton redirectUrl="/">
                            <button
                                className={`
                                    w-full flex items-center justify-center px-3 py-2 text-sm font-medium
                                    rounded-lg transition-all duration-200 border
                                    ${theme === "light"
                                        ? "text-red-500 border-red-200 hover:bg-red-50"
                                        : "text-red-400 border-red-900 hover:bg-red-950/40"}
                                `}
                            >
                                Logout
                            </button>
                        </SignOutButton>
                    </div>
                </nav>
            </aside>
        </>
    );
}

/* ---------- Nav Item ---------- */

function NavItem({
    href,
    icon,
    label,
    theme,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    theme: string;
}) {
    const pathname = usePathname();

    const isActive =
        pathname === href ||
        (pathname.startsWith(`${href}/`) &&
            href !== "/dashboard");

    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm
                transition-all duration-200
                ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : theme === "light"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"}
            `}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}