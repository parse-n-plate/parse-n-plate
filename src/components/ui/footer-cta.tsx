'use client';

import { Button } from './button';
import Image from 'next/image';

/**
 * FooterCTA Component
 * 
 * Displays a dark footer section matching Figma design:
 * - Text content on the left (headline, button, copyright)
 * - Large fish logo on the right, extending from bottom-right
 */
export default function FooterCTA() {
  return (
    <div className="bg-stone-950 min-h-[300px] md:h-[337px] overflow-hidden relative rounded-2xl shrink-0 w-full">
      {/* Left Content Container */}
      <div className="relative z-10 flex flex-col gap-2.5 items-start justify-center md:absolute md:left-[38px] p-6 md:p-2.5 md:top-[42px]">
        {/* Headline */}
        <div className="font-domine leading-[1.1] text-[32px] md:text-[48px] text-stone-50">
          <p className="mb-0">Clean recipes,</p>
          <p>fast cooking.</p>
        </div>

        {/* CTA Button */}
        <Button
          className="
            bg-stone-900 hover:bg-stone-800
            text-stone-50 font-albert text-[14px]
            px-5 py-2 rounded-full
            transition-all duration-200
            active:scale-95
            mt-2
          "
        >
          Find Recipe
        </Button>

        {/* Copyright */}
        <p className="font-albert leading-none text-[14px] md:text-[16px] text-stone-50 mt-2">
          © Parse and Plate 2025
        </p>
      </div>

      {/* Right Side - Large Fish Logo extending from bottom-right */}
      <div className="absolute right-0 bottom-0 z-0 translate-x-[10%] translate-y-[10%] md:right-[53px] md:bottom-[31px] md:translate-x-0 md:translate-y-0">
        <Image
          src="/assets/icons/fish logo.svg"
          alt="Parse and Plate Logo"
          width={300}
          height={300}
          className="object-contain w-[180px] h-[180px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px]"
        />
      </div>
    </div>
  );
}

