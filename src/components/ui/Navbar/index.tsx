'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import PPLogo from '@/components/ui/Navbar/pplogo';
import Link from 'next/link';
import NavbarSearch from '@/components/ui/Navbar/navbar-search';
import MobileSearchDialog from '@/components/ui/Navbar/mobile-search-dialog';

export default function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-[#d9d9d9] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 md:gap-6">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <PPLogo />
            </Link>
          </div>

          {/* Center: Search - Desktop only (lg and above) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-4">
            <NavbarSearch />
          </div>

          {/* Right: Mobile Search Button (mobile and tablet) */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Open search"
            >
              <Search className="w-5 h-5 text-stone-700" />
            </button>
          </div>

          {/* Right: Empty space for balance on desktop - Auth buttons removed per requirements */}
          <div className="hidden lg:block flex-shrink-0 w-14"></div>
        </div>
      </div>

      {/* Mobile Search Dialog */}
      <MobileSearchDialog
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
}
