'use client';

import { useState } from 'react';

// List of cuisine categories
const categories = [
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
];

interface CategoryFiltersProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategoryFilters({
  selectedCategory = 'Asian',
  onCategoryChange,
}: CategoryFiltersProps) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    // Call the optional callback if provided
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center px-4 py-4">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`
              font-albert text-[14px] px-4 py-2 rounded-full
              transition-all duration-200
              ${
                isActive
                  ? 'bg-stone-200 text-black font-medium'
                  : 'bg-white border border-[#d9d9d9] text-black hover:border-[#4F46E5]'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

