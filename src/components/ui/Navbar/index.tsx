'use client';

import PPLogo from '@/components/ui/Navbar/pplogo';
import Link from 'next/link';
import NavbarSearch from '@/components/ui/Navbar/navbar-search';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

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

          {/* Right: Close button on mobile, empty space on desktop */}
          <div className="hidden md:block flex-shrink-0 w-14"></div>
          
          {/* Mobile: Close button - visible only on mobile screens */}
          <button
            onClick={() => router.push('/')}
            className="md:hidden bg-white rounded-full p-4 flex items-center justify-center shrink-0 w-12 h-12 hover:bg-stone-50 transition-colors ml-auto"
            aria-label="Close and return to homepage"
          >
            <X className="w-6 h-6 text-stone-600" />
          </button>
        </div>
      </div>
    </>
  );
}
