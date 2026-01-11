"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, UserButton, useUser, SignOutButton } from "@clerk/nextjs";

import {
    LayoutDashboard,
    Building2,
    GraduationCap,
    Calendar,
    MessageSquare,
    User,
} from "lucide-react";

export default function Sidebar() {
    const { user } = useUser();

    return (
        <aside className="w-64 h-screen bg-white  flex flex-col">

            {/* Logo */}
            <div className="h-16 px-6 border-b flex items-center">
                <div className="relative w-32 h-8">
                    <Image
                        src="/logo.svg"
                        alt="App Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Profile */}
            <SignedIn>
                <div className="px-6 py-4  flex items-center gap-3">
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
                <NavItem
                    href="/dashboard"
                    icon={<LayoutDashboard size={18} />}
                    label="Overview"
                />
                <NavItem
                    href="/dashboard/organisations"
                    icon={<Building2 size={18} />}
                    label="Organisations"
                />
                <NavItem
                    href="/dashboard/classrooms"
                    icon={<GraduationCap size={18} />}
                    label="Classrooms"
                />
                <NavItem
                    href="/dashboard/schedules"
                    icon={<Calendar size={18} />}
                    label="Schedules"
                />
                <NavItem
                    href="/dashboard/conversations"
                    icon={<MessageSquare size={18} />}
                    label="Conversations"
                />
                <NavItem
                    href="/dashboard/profile"
                    icon={<User size={18} />}
                    label="Profile"
                />
                <div className="px-4 py-4 ">
                    <SignOutButton redirectUrl="/">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition rounded-lg bg-red-50 border border-red-600">
                            Logout
                        </button>
                    </SignOutButton>
                </div>
            </nav>
            {/* Logout */}
            

        </aside>
    );
}

function NavItem({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
