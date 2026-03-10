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
    <nav className="fixed top-0 left-0 w-full h-20 px-6 flex items-center justify-center z-50">
      <div className='max-w-7xl w-full flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-3xl p-4 shadow-blue-500/5'>
        {/* Left */}
        <div className="flex items-center gap-2">
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

        {/* Right */}
        <div className="flex items-center gap-6">
          <SignedOut>
            <SignInButton>
              <button className="text-sm font-light text-gray-500 tracking-wide hover:text-blue-500 transition-colors">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-light tracking-wide hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200 transition-all active:scale-95">
                Join
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              {/* Name + Email */}
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-sm font-light text-gray-800 tracking-wide">
                  {user?.fullName}
                </span>
                <span className="text-[10px] text-gray-400 font-extralight tracking-[0.2em] uppercase">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              {/* Profile */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100",
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
