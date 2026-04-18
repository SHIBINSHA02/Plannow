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
} from "lucide-react";

export default function Sidebar() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* ✅ Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-gray-300 bg-white">
                <button onClick={() => setOpen(true)}>
                    <Menu size={24} />
                </button>

                <Link href="/">
                    <div className="relative w-28 h-8">
                        <Image
                            src="/logo.png"
                            alt="App Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>
            </div>

            {/* ✅ Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* ✅ Sidebar */}
            <aside
                className={`
                    fixed z-50 top-0 left-0 h-screen w-64 bg-white
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:flex
                    flex-col
                `}
            >
                {/* Header */}
                <div className="h-16 px-6 border-b border-gray-300 flex items-center justify-between">
                    <Link href="/">
                        <div className="relative w-32 h-8">
                            <Image
                                src="/logo.png"
                                alt="App Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Close button (mobile only) */}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile */}
                <SignedIn>
                    <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-300 rounded-3xl">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }}
                            afterSignOutUrl="/"
                        />

                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">
                                {user?.fullName}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[140px]">
                                {user?.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                    </div>
                </SignedIn>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
                    <NavItem href="/dashboard/organisations" icon={<Building2 size={18} />} label="Organisations" />
                    <NavItem href="/dashboard/classrooms" icon={<GraduationCap size={18} />} label="Classrooms" />
                    <NavItem href="/dashboard/schedules" icon={<Calendar size={18} />} label="Schedules" />
                    <NavItem href="/dashboard/substitution" icon={<MessageSquare size={18} />} label="Substitution" />
                    <NavItem href="/dashboard/profile" icon={<User size={18} />} label="Profile" />

                    <div className="pt-4">
                        <SignOutButton redirectUrl="/">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg bg-red-50 border border-red-600 hover:bg-red-100 transition">
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
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname.startsWith(`${href}/`) && href !== "/dashboard");

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
