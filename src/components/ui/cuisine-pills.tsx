'use client';

import { useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';

// Cuisine categories matching the prototype
const CUISINES = [
  'Asian',
  'Italian',
  'Mexican',
  'Mediterranean',
  'French',
  'Indian',
  'Japanese',
  'Korean',
  'Hawaiian',
  'More 12+',
] as const;

export type CuisineType = (typeof CUISINES)[number] | 'All';

interface CuisinePillsProps {
  onCuisineChange?: (cuisine: CuisineType) => void;
}

export default function CuisinePills({ onCuisineChange }: CuisinePillsProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('Asian');

  const handleCuisineClick = (cuisine: CuisineType) => {
    setSelectedCuisine(cuisine);
    if (onCuisineChange) {
      onCuisineChange(cuisine);
    }
  };

  return (
    <div className="relative w-full">
      {/* Scroll container keeps content aligned to parent padding; overflow only to the right */}
      <div className="overflow-x-auto pr-6">
        <LayoutGroup>
          <div className="flex items-center gap-2 py-1">
            {CUISINES.map((cuisine) => {
              const isSelected = selectedCuisine === cuisine;
              return (
                <motion.button
                  key={cuisine}
                  layout="position"
                  aria-pressed={isSelected}
                  onClick={() => handleCuisineClick(cuisine)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    borderColor: isSelected ? '#d6d3d1' : '#e7e5e4',
                    backgroundColor: isSelected ? '#e7e5e4' : '#ffffff',
                    color: '#0a0a0a',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="relative flex-shrink-0 px-5 py-2 rounded-full font-albert text-[16px] font-medium leading-[1.4] border whitespace-nowrap bg-white overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-0"
                >
                  {isSelected && (
                    <motion.span
                      layoutId="cuisine-pill-highlight"
                      className="absolute inset-0 rounded-full bg-stone-200"
                      transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10">{cuisine}</span>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Right edge gradient hints at more content off-screen; pointer-events-none so scroll still works */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white to-transparent z-20"
        aria-hidden
      />
    </div>
  );
}

