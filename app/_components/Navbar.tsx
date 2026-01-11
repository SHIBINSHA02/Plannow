"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="w-full h-16 px-6 flex items-center justify-center my-3 ">
          <div className='lg:w-full  flex items-center justify-between   shadow-blue-100 rounded-lg p-3 mt-3 shadow'>
        {/* Left */}
        <div className="flex items-center gap-2">
        <div className="relative w-40 h-10">
            <Image
                src="/logo.svg"
                alt="App Logo"
                fill
                className="object-contain"
                priority
            />
            </div>
        
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
            <SignedOut>
            <SignInButton>
                <button className="text-sm font-medium">
                Sign In
                </button>
            </SignInButton>

            <SignUpButton>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
                </button>
            </SignUpButton>
            </SignedOut>

            <SignedIn>
            <div className="flex items-center gap-3">
                {/* Name + Email */}
                <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-sm font-medium">
                    {user?.fullName}
                </span>
                <span className="text-xs text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                </span>
                </div>

                {/* Profile */}
                <UserButton
                appearance={{
                    elements: {
                    avatarBox: "w-9 h-9",
                    },
                }}
                />
            </div>
            </SignedIn>
        </div>
      </div>
    </nav>
  );
}
