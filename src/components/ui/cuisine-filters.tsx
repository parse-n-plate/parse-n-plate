'use client';

import { CUISINE_CATEGORIES } from '@/lib/mockRecipeData';

interface CuisineFiltersProps {
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
}

/**
 * CuisineFilters Component
 * 
 * Displays filter pills for different cuisine categories.
 * Users can click on a category to filter recipes.
 * 
 * @param selectedCuisine - Currently selected cuisine category (empty string for "all")
 * @param onCuisineChange - Callback function when a cuisine is selected/deselected
 */
export default function CuisineFilters({
  selectedCuisine,
  onCuisineChange,
}: CuisineFiltersProps) {
  /**
   * Handle filter button click
   * If the clicked cuisine is already selected, deselect it (show all)
   * Otherwise, select the clicked cuisine
   */
  const handleFilterClick = (cuisine: string) => {
    if (selectedCuisine === cuisine) {
      // Deselect if already selected (show all recipes)
      onCuisineChange('');
    } else {
      // Select the clicked cuisine
      onCuisineChange(cuisine);
    }
  };

  return (
    <div className="w-full py-6">
      {/* Filter pills container - wraps on smaller screens */}
      <div className="flex flex-wrap gap-2 items-center justify-start">
        {/* Map through all cuisine categories */}
        {CUISINE_CATEGORIES.map((cuisine) => {
          const isActive = selectedCuisine === cuisine;

          return (
            <button
              key={cuisine}
              onClick={() => handleFilterClick(cuisine)}
              className={`
                px-5 py-2 rounded-full
                font-albert text-[14px] font-medium
                transition-all duration-200
                active:scale-95
                ${
                  isActive
                    ? 'bg-stone-200 text-black' // Active state: filled background
                    : 'bg-white border border-stone-200 text-black hover:bg-stone-50' // Inactive state: outlined
                }
              `}
              aria-pressed={isActive}
            >
              {cuisine}
            </button>
          );
        })}

        {/* "More 12+" button - placeholder for additional categories */}
        <button
          className="
            px-5 py-2 rounded-full
            bg-white border border-stone-200 text-black
            font-albert text-[14px] font-medium
            hover:bg-stone-50 transition-all duration-200
            active:scale-95
          "
        >
          More 12+
        </button>
      </div>
    </div>
  );
}





