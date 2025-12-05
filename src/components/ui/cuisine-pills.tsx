'use client';

import { useState } from 'react';

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
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-2 px-4 md:px-0">
        {CUISINES.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              onClick={() => handleCuisineClick(cuisine)}
              className={`
                flex-shrink-0 px-5 py-2 rounded-full font-albert text-[14px] font-medium
                transition-all duration-200 whitespace-nowrap leading-[1.4]
                ${
                  isSelected
                    ? 'bg-stone-200 text-black'
                    : 'bg-white border border-stone-200 text-black hover:border-[#4F46E5] hover:border-opacity-60'
                }
              `}
            >
              {cuisine}
            </button>
          );
        })}
      </div>
    </div>
  );
}

