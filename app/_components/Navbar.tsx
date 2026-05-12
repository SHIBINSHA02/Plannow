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
    <nav className="fixed top-5 left-0 w-full h-10 flex items-center justify-center z-50">
      <div className='max-w-7xl w-full flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-2xl  shadow-blue-500/5'>
        {/* Left */}
        <div className="flex items-center">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="App Logo"
              width={150}
              height={40}
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
              <button className="bg-gray-900 text-white px-5 py-4 rounded-2xl  text-sm font-light tracking-wide hover:bg-blue-700 hover:text-white hover:ring-1 hover:ring-blue-700/50 transition-all active:scale-95">
                Join
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-30 h-30 border-2 border-white shadow-sm ring-1 ring-gray-100",
                  },
                }}
              />
            <div className="flex items-center gap-6">
              {/* Name + Email */}
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-sm font-light text-gray-800 tracking-wide">
                  {user?.fullName}
                </span>
                <span className="text-[10px] text-gray-400 font-extralight">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              {/* Profile */}
            
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
