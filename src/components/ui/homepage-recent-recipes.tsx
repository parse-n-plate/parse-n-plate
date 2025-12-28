'use client';

import { useState } from 'react';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import Bookmark from '@solar-icons/react/csr/school/Bookmark';

/**
 * HomepageRecentRecipes Component
 * 
 * Displays recent recipes as a vertical list under the search bar.
 * Each recipe shows: name, preparation time pill, and bookmark icon.
 * Based on Figma design - clean, minimal vertical list.
 */
export default function HomepageRecentRecipes() {
  const { recentRecipes, getRecipeById } = useParsedRecipes();
  const { setParsedRecipe } = useRecipe();
  const router = useRouter();
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Set<string>>(new Set());

  // Get recent recipes (limit to show a reasonable number)
  const displayRecipes = recentRecipes.slice(0, 10);

  // Format time display (e.g., "35m", "3h 30m", "48m")
  const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get time to display (prefer totalTime, then prepTime + cookTime, then prepTime or cookTime)
  const getDisplayTime = (recipe: typeof recentRecipes[0]): string => {
    if (recipe.totalTimeMinutes) {
      return formatTime(recipe.totalTimeMinutes);
    }
    
    if (recipe.prepTimeMinutes && recipe.cookTimeMinutes) {
      return formatTime(recipe.prepTimeMinutes + recipe.cookTimeMinutes);
    }
    
    if (recipe.prepTimeMinutes) {
      return formatTime(recipe.prepTimeMinutes);
    }
    
    if (recipe.cookTimeMinutes) {
      return formatTime(recipe.cookTimeMinutes);
    }
    
    return '';
  };

  // Handle recipe click - navigate to parsed recipe page
  const handleRecipeClick = (recipeId: string) => {
    try {
      const fullRecipe = getRecipeById(recipeId);
      if (fullRecipe && fullRecipe.ingredients && fullRecipe.instructions) {
        setParsedRecipe({
          title: fullRecipe.title,
          ingredients: fullRecipe.ingredients,
          instructions: fullRecipe.instructions,
          author: fullRecipe.author,
          sourceUrl: fullRecipe.sourceUrl || fullRecipe.url,
          summary: fullRecipe.description || fullRecipe.summary,
          cuisine: fullRecipe.cuisine,
        });
        router.push('/parsed-recipe-page');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation(); // Prevent triggering the recipe click
    setBookmarkedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  // Don't render if no recipes
  if (displayRecipes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Section Title */}
      <h2 className="font-albert text-base text-stone-500 text-left mb-4 pl-4 font-medium">
        Recent Recipes
      </h2>

      {/* Recipe List */}
      <div className="space-y-3">
        {displayRecipes.map((recipe) => {
          const isBookmarked = bookmarkedRecipes.has(recipe.id);
          const displayTime = getDisplayTime(recipe);

          return (
            <button
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)}
              className="
                w-full flex items-center justify-between
                py-2 pr-2
                hover:bg-stone-50 rounded-lg
                transition-colors duration-200
                group
                focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2
              "
            >
              {/* Left: Recipe Name and Time */}
              <div className="flex items-center gap-3 flex-1 min-w-0 pl-4">
                <span className="font-albert text-xl text-stone-800 text-left truncate" style={{ fontSize: '16px' }}>
                  {recipe.title}
                </span>
                {displayTime && (
                  <span className="
                    font-albert text-sm text-stone-600
                    bg-stone-100 px-2.5 py-1 rounded-full
                    flex-shrink-0
                  ">
                    {displayTime}
                  </span>
                )}
              </div>

              {/* Right: Bookmark Icon */}
              <button
                onClick={(e) => handleBookmarkToggle(e, recipe.id)}
                className="
                  flex-shrink-0 p-1
                  rounded-full
                  transition-colors duration-200
                  ml-2
                "
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark recipe'}
              >
                <Bookmark
                  className={`
                    w-5 h-5 transition-colors duration-200
                    ${isBookmarked 
                      ? 'fill-[#78716C] text-[#78716C]' 
                      : 'text-[#E7E5E4] hover:fill-[#E7E5E4]'
                    }
                  `}
                />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}

