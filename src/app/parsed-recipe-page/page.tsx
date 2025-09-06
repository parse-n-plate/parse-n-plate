'use client';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import RecipeSkeleton from '@/components/ui/recipe-skeleton';
import * as Tabs from '@radix-ui/react-tabs';

// Helper function to format ingredient
const formatIngredient = (
  ingredient: string | { amount?: string; units?: string; ingredient: string },
): string => {
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  if (
    typeof ingredient === 'object' &&
    ingredient.amount &&
    ingredient.ingredient
  ) {
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
  const { parsedRecipe, clearRecipe, isLoaded } = useRecipe();
  const router = useRouter();

  // Redirect if loaded and no recipe
  useEffect(() => {
    if (isLoaded && !parsedRecipe) {
      router.push('/');
    }
  }, [isLoaded, parsedRecipe, router]);

  if (!isLoaded) {
    return <RecipeSkeleton />;
  }

  if (!parsedRecipe) {
    return (
      <div className="bg-[#fbf7f2] min-h-screen flex items-center justify-center">
        <div className="font-albert text-[16px] text-[#1e1e1e]">
          No recipe data found. Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbf7f2] min-h-screen">
      <div className="transition-opacity duration-300 ease-in-out opacity-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            {/* Recipe Image Placeholder */}
            <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <span className="font-albert text-[16px] text-[#757575]">
                Recipe Image Placeholder
              </span>
            </div>
            
            {/* Title and Parse Another Recipe Button */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="font-domine text-[32px] text-[#1e1e1e] leading-none mb-4">
                  {parsedRecipe.title || 'Parsed Recipe'}
                </h1>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#ffa424] text-white px-3 py-1 rounded-full text-sm font-albert">
                    Main Course
                  </span>
                  <span className="bg-white border border-[#d9d9d9] text-[#1e1e1e] px-3 py-1 rounded-full text-sm font-albert">
                    Italian
                  </span>
                  <span className="bg-white border border-[#d9d9d9] text-[#1e1e1e] px-3 py-1 rounded-full text-sm font-albert">
                    Comfort Food
                  </span>
                </div>
                
                {/* Times */}
                <div className="flex gap-6 text-sm font-albert text-[#757575]">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Prep: 15 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔥</span>
                    <span>Cook: 30 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🍽️</span>
                    <span>Ready: 45 min</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  clearRecipe();
                  router.push('/');
                }}
                className="bg-white border border-[#d9d9d9] rounded-lg px-4 py-2 font-albert text-[14px] text-[#1e1e1e] hover:bg-gray-50 transition-colors ml-4"
              >
                Parse Another Recipe
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs.Root defaultValue="prep" className="w-full">
            {/* Tab List */}
            <Tabs.List className="flex border-b border-[#d9d9d9] mb-6">
              <Tabs.Trigger
                value="prep"
                className="px-6 py-3 font-albert text-[16px] text-[#1e1e1e] border-b-2 border-transparent data-[state=active]:border-[#ffa424] data-[state=active]:text-[#ffa424] hover:text-[#ffa424] transition-colors"
              >
                Prep
              </Tabs.Trigger>
              <Tabs.Trigger
                value="cook"
                className="px-6 py-3 font-albert text-[16px] text-[#1e1e1e] border-b-2 border-transparent data-[state=active]:border-[#ffa424] data-[state=active]:text-[#ffa424] hover:text-[#ffa424] transition-colors"
              >
                Cook
              </Tabs.Trigger>
              <Tabs.Trigger
                value="plate"
                className="px-6 py-3 font-albert text-[16px] text-[#1e1e1e] border-b-2 border-transparent data-[state=active]:border-[#ffa424] data-[state=active]:text-[#ffa424] hover:text-[#ffa424] transition-colors"
              >
                Plate
              </Tabs.Trigger>
            </Tabs.List>

            {/* Prep Tab Content */}
            <Tabs.Content value="prep" className="space-y-6">
              {/* Recipe Description */}
              <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
                <h2 className="font-domine text-[24px] text-[#1e1e1e] mb-4 leading-none">
                  About This Recipe
                </h2>
                <p className="font-albert text-[16px] text-[#1e1e1e] leading-[1.4] mb-6">
                  A delicious recipe that will delight your taste buds. Perfect for any occasion and sure to become a family favorite.
                </p>
                
                {/* Times Again */}
                <div className="flex gap-6 text-sm font-albert text-[#757575] mb-6">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Prep: 15 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔥</span>
                    <span>Cook: 30 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🍽️</span>
                    <span>Ready: 45 min</span>
                  </div>
                </div>
                
                {/* Rating and Skill Level */}
                <div className="flex gap-8 mb-6">
                  <div>
                    <h3 className="font-domine text-[18px] text-[#1e1e1e] mb-2 leading-none">
                      Rating
                    </h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-[#ffa424] text-lg">
                          ⭐
                        </span>
                      ))}
                      <span className="font-albert text-[14px] text-[#757575] ml-2">
                        4.8 (127 reviews)
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-domine text-[18px] text-[#1e1e1e] mb-2 leading-none">
                      Skill Level
                    </h3>
                    <span className="bg-[#ffa424] text-white px-3 py-1 rounded-full text-sm font-albert">
                      Intermediate
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
                <h2 className="font-domine text-[24px] text-[#1e1e1e] mb-6 leading-none">
                  Ingredients
                </h2>
                {Array.isArray(parsedRecipe.ingredients) &&
                  parsedRecipe.ingredients.map(
                    (
                      group: {
                        groupName: string;
                        ingredients: Array<
                          | string
                          | {
                              amount?: string;
                              units?: string;
                              ingredient: string;
                            }
                        >;
                      },
                      groupIdx: number,
                    ) => (
                      <div key={groupIdx} className="mb-6 last:mb-0">
                        <h3 className="font-domine text-[18px] text-[#1e1e1e] mb-3 leading-none">
                          {group.groupName}
                        </h3>
                        <ul className="space-y-2">
                          {Array.isArray(group.ingredients) &&
                            group.ingredients.map(
                              (
                                ingredient:
                                  | string
                                  | {
                                      amount?: string;
                                      units?: string;
                                      ingredient: string;
                                    },
                                index: number,
                              ) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-[#757575] text-sm mt-1">
                                    •
                                  </span>
                                  <span className="font-albert text-[16px] text-[#1e1e1e] leading-[1.4]">
                                    {formatIngredient(ingredient)}
                                  </span>
                                </li>
                              ),
                            )}
                        </ul>
                      </div>
                    ),
                  )}
              </div>
            </Tabs.Content>

            {/* Cook Tab Content */}
            <Tabs.Content value="cook" className="space-y-6">
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
            </Tabs.Content>

            {/* Plate Tab Content */}
            <Tabs.Content value="plate" className="space-y-6">
              <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
                <h2 className="font-domine text-[24px] text-[#1e1e1e] mb-6 leading-none">
                  Plate & Serve
                </h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="font-albert text-[18px] text-[#757575]">
                    Coming soon...
                  </p>
                  <p className="font-albert text-[14px] text-[#757575] mt-2">
                    Plating suggestions and serving tips will be available here.
                  </p>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
