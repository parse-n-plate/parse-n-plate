'use client';

import PPLogo from '@/components/ui/Navbar/pplogo';
import Link from 'next/link';
import NavbarSearch from '@/components/ui/Navbar/navbar-search';

export default function Navbar() {
  return (
    <>
      <div className="bg-white px-3 md:px-4 py-3 md:py-4 sticky top-0 z-40 border-b border-stone-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-6">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <PPLogo />
            </Link>
          </div>

          {/* Center: Search - Always visible on all screen sizes */}
          <div className="flex flex-1 max-w-lg mx-1 md:mx-4">
            <NavbarSearch />
          </div>

          {/* Right: Empty space for balance - Hidden on mobile to save space */}
          <div className="hidden md:block flex-shrink-0 w-14"></div>
        </div>
      </div>
    </>
  );
}
