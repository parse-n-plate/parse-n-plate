'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white w-full py-12 px-4 md:px-8 relative overflow-hidden rounded-t-[16px]">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left: Text and Button */}
          <div className="flex flex-col gap-[10px]">
            <h2 className="font-domine text-[40px] md:text-[48px] font-normal leading-[1.1] text-stone-50">
              Clean recipes,
              <br />
              fast cooking.
            </h2>
            <Link
              href="/"
              className="
                inline-flex items-center justify-center
                bg-stone-900 text-stone-50
                font-albert font-medium text-[16px] leading-[1.4] px-5 py-2 rounded-full
                hover:bg-stone-800 transition-all duration-200
                w-fit
              "
            >
              Find Recipe
            </Link>
            <p className="font-albert text-[14px] md:text-[16px] leading-none text-stone-50">
              © Parse and Plate 2025
            </p>
          </div>

          {/* Right: Fish Logo Illustration */}
          <div className="flex-shrink-0 absolute right-0 top-0 bottom-0 md:relative md:static">
            <div className="w-32 h-32 md:w-40 md:h-40 relative">
              <Image
                src="/assets/icons/fish logo.svg"
                alt="Parse and Plate Logo"
                fill
                className="object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

