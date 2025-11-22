'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FooterBanner() {
  const router = useRouter();

  // Handle "Find Recipe" button click - scroll to top or navigate
  const handleFindRecipe = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Text and Button */}
        <div className="flex-1 space-y-6">
          <h2 className="font-domine text-[48px] leading-[1.1] text-white">
            Clean recipes,
            <br />
            fast cooking.
          </h2>
          <button
            onClick={handleFindRecipe}
            className="
              bg-transparent border-2 border-white text-white
              font-albert text-[16px] px-6 py-3 rounded-lg
              hover:bg-white hover:text-black
              transition-all duration-200
            "
          >
            Find Recipe
          </button>
          <p className="font-albert text-[14px] text-stone-400">
            © Parse and Plate 2025
          </p>
        </div>

        {/* Right Side: Fish Illustration */}
        <div className="flex-shrink-0">
          {/* Using the fish logo as a placeholder for the chef hat fish illustration */}
          {/* In production, you'd use the actual chef hat fish illustration */}
          <div className="w-48 h-48 md:w-64 md:h-64 relative">
            <Image
              src="/assets/icons/fish logo.svg"
              alt="Parse and Plate Logo"
              width={256}
              height={256}
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

