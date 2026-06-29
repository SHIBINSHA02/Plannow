// app/_components/Navbar.tsx
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
    // FIX: Removed rigid h-10. Added px-4 so the navbar doesn't slam into the edge of mobile screens.
    <nav className="fixed top-5 left-0 w-full flex items-center justify-center z-50 px-4">
      {/* FIX: Added px-4 sm:px-6 and py-2 to give inner content consistent breathing room */}
      <div className="max-w-7xl w-full flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-2xl shadow-blue-500/5 px-4 py-2 sm:px-6">
        
        {/* Left Section */}
        <div className="flex items-center flex-shrink-0">
          <div className="relative">
            <Image
              src="/logo2.png"
              alt="App Logo"
              width={120} // FIX: Slightly scaled down base width so it fits smaller mobile screens smoothly
              height={32}
              className="object-contain w-auto h-8 sm:h-10" // FIX: Uses responsive height classes
              priority
            />
          </div>
        </div>

        {/* Right Section */}
        {/* FIX: Adjusted gap to be smaller on mobile (gap-3) and standard on desktop (sm:gap-6) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-xs sm:text-sm font-light text-gray-500 tracking-wide hover:text-blue-500 transition-colors">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              {/* FIX: Changed py-4 to responsive padding (py-2 sm:py-3) so it doesn't break the container layout */}
              <button className="bg-gray-900 text-white px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-light tracking-wide hover:bg-blue-700 hover:text-white hover:ring-1 hover:ring-blue-700/50 transition-all active:scale-95">
                Join
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Name + Email */}
              {/* FIX: Hidden on mobile to prevent massive text layout overlaps, displays seamlessly from 'md' screens up */}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-xs sm:text-sm font-light text-gray-800 tracking-wide">
                  {user?.fullName}
                </span>
                <span className="text-[10px] text-gray-400 font-extralight">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              <div className="flex items-center justify-center">
                <UserButton
                  appearance={{
                    elements: {
                      // FIX: Replaced invalid 'w-30 h-30' with valid responsive classes 'w-8 h-8 sm:w-9 sm:h-9'
                      avatarBox: "w-8 h-8 sm:w-9 sm:h-9 border border-gray-200 shadow-sm",
                    },
                  }}
                />
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}