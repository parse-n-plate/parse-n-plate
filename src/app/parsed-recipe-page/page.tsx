'use client';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper function to format ingredient
const formatIngredient = (ingredient: any): string => {
  if (typeof ingredient === 'string') {
    return ingredient;
  }
  
  if (typeof ingredient === 'object' && ingredient.amount && ingredient.ingredient) {
    const parts = [];
    if (ingredient.amount && ingredient.amount !== 'as much as you like') {
      parts.push(ingredient.amount);
    }
    if (ingredient.units) {
      parts.push(ingredient.units);
    }
    parts.push(ingredient.ingredient);
    return parts.join(' ');
  }
  
  return String(ingredient);
};

export default function ParsedRecipePage() {
  const { parsedRecipe, clearRecipe } = useRecipe();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a moment for context to load from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!parsedRecipe) {
        router.push('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [parsedRecipe, router]);

  if (isLoading) {
    return (
      <div className="bg-[#fbf7f2] min-h-screen flex items-center justify-center">
        <div className="font-albert text-[16px] text-[#1e1e1e]">Loading...</div>
      </div>
    );
  }

  if (!parsedRecipe) {
    return (
      <div className="bg-[#fbf7f2] min-h-screen flex items-center justify-center">
        <div className="font-albert text-[16px] text-[#1e1e1e]">No recipe data found. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbf7f2] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-domine text-[32px] text-[#1e1e1e] leading-none">
          {parsedRecipe.title || 'Parsed Recipe'}
        </h1>
        <button
          onClick={() => {
            clearRecipe();
            router.push('/');
          }}
            className="bg-white border border-[#d9d9d9] rounded-lg px-4 py-2 font-albert text-[14px] text-[#1e1e1e] hover:bg-gray-50 transition-colors"
        >
          Parse Another Recipe
        </button>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients Section */}
          <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
            <h2 className="font-domine text-[24px] text-[#1e1e1e] mb-6 leading-none">
            Ingredients
          </h2>
            {Array.isArray(parsedRecipe.ingredients) &&
              parsedRecipe.ingredients.map((group: any, groupIdx: number) => (
                <div key={groupIdx} className="mb-6 last:mb-0">
                  <h3 className="font-domine text-[18px] text-[#1e1e1e] mb-3 leading-none">
                    {group.groupName}
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(group.ingredients) &&
                      group.ingredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                          <span className="text-[#757575] text-sm mt-1">•</span>
                          <span className="font-albert text-[16px] text-[#1e1e1e] leading-[1.4]">
                            {formatIngredient(ingredient)}
                          </span>
                </li>
              ))}
          </ul>
                </div>
              ))}
        </div>

        {/* Instructions Section */}
          <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
            <h2 className="font-domine text-[24px] text-[#1e1e1e] mb-6 leading-none">
            Instructions
          </h2>
            <ol className="space-y-4">
            {Array.isArray(parsedRecipe.instructions) &&
              parsedRecipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                    <span className="bg-[#ffa424] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 font-albert">
                    {index + 1}
                  </span>
                    <span className="font-albert text-[16px] text-[#1e1e1e] leading-[1.4]">
                      {instruction}
                    </span>
                </li>
              ))}
          </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
