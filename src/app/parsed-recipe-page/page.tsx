'use client';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import RecipeSkeleton from '@/components/ui/recipe-skeleton';
import * as Tabs from '@radix-ui/react-tabs';

// Helper function to format ingredient
const formatIngredient = (
  ingredient: string | { amount?: string; units?: string; ingredient: string } | null | undefined,
): string => {
  // Handle null or undefined
  if (ingredient === null || ingredient === undefined) {
    return '';
  }

  // Handle string ingredients
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  // Handle object ingredients
  if (typeof ingredient === 'object') {
    // Check if it's an array (shouldn't happen, but handle it)
    if (Array.isArray(ingredient)) {
      return ingredient.join(', ');
    }

    // Handle ingredient objects with proper structure
    // Even if amount is missing, we should still try to format it
    if ('ingredient' in ingredient && ingredient.ingredient) {
      const parts = [];
      
      // Add amount if it exists and is valid
      if (ingredient.amount && ingredient.amount.trim() && ingredient.amount !== 'as much as you like') {
        parts.push(ingredient.amount.trim());
      }
      
      // Add units if they exist
      if (ingredient.units && ingredient.units.trim()) {
        parts.push(ingredient.units.trim());
      }
      
      // Always add the ingredient name
      parts.push(ingredient.ingredient.trim());
      
      return parts.join(' ');
    }

    // If it's an object but doesn't match expected structure, try to extract what we can
    // This handles edge cases where the structure might be different
    if ('ingredient' in ingredient) {
      return String(ingredient.ingredient || '');
    }
  }

  // Fallback: try to convert to string safely
  try {
    return String(ingredient);
  } catch {
    return '';
  }
};

export default function ParsedRecipePage() {
  const { parsedRecipe, isLoaded } = useRecipe();
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
    <div className="bg-stone-50 min-h-screen relative max-w-full overflow-x-hidden">
      <div className="transition-opacity duration-300 ease-in-out opacity-100">
        {/* Hero Section - Title and Author */}
        <div className="w-full px-4 md:px-8 pt-6 pb-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col">
              <h1 className="font-domine text-[40px] text-black leading-[1.1] mb-1">
                {parsedRecipe.title || 'Beef Udon'}
              </h1>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-albert text-[14px] text-stone-600">
                  <span className="text-black font-medium">
                    {parsedRecipe.author ? `By ${parsedRecipe.author}` : 'Unknown Author'}
                  </span>
                  
                  {parsedRecipe.publishedDate && (
                    <>
                      <span className="hidden sm:inline text-stone-300">•</span>
                      <span>{parsedRecipe.publishedDate}</span>
                    </>
                  )}
                  
                  {parsedRecipe.sourceUrl && (
                    <>
                      <span className="hidden sm:inline text-stone-300">•</span>
                      <a 
                        href={parsedRecipe.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#4F46E5] hover:underline hover:text-[#4338ca] transition-colors"
                      >
                        View Source
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-8 py-6 space-y-6">
          {/* Tabs Section */}
          <Tabs.Root defaultValue="prep" className="w-full">
            {/* Tab List */}
            <Tabs.List className="flex gap-1 items-center justify-start mb-6">
              <Tabs.Trigger
                value="prep"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 data-[state=inactive]:bg-stone-50 data-[state=inactive]:border-stone-200 transition-all duration-200 hover:bg-stone-100 hover:border-stone-300"
              >
                <span className="text-stone-700 data-[state=active]:text-stone-900 text-lg">
                  🔪
                </span>
                <span className="font-albert-semibold text-[15px] text-stone-700 data-[state=active]:text-stone-900">
                  Prep
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="cook"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 data-[state=inactive]:bg-stone-50 transition-all duration-200 hover:bg-stone-100 hover:border-stone-300"
              >
                <span className="text-stone-700 data-[state=active]:text-stone-900 text-lg">
                  🍳
                </span>
                <span className="font-albert-semibold text-[15px] text-stone-700 data-[state=active]:text-stone-900">
                  Cook
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="plate"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 data-[state=inactive]:bg-stone-50 transition-all duration-200 hover:bg-stone-100 hover:border-stone-300"
              >
                <span className="text-stone-700 data-[state=active]:text-stone-900 text-lg">
                  🍽️
                </span>
                <span className="font-albert-semibold text-[15px] text-stone-700 data-[state=active]:text-stone-900">
                  Plate
                </span>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Prep Tab Content */}
            <Tabs.Content value="prep" className="space-y-6">
              {/* Ingredients */}
              <div className="bg-stone-100 rounded-lg p-6">
                <h2 className="font-domine text-[20px] text-stone-950 mb-6 leading-[1.1]">
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
              <div className="bg-stone-100 rounded-lg p-6">
                <h2 className="font-domine text-[20px] text-stone-950 mb-6 leading-[1.1]">
                  Instructions
                </h2>
                <ol className="space-y-4">
                  {Array.isArray(parsedRecipe.instructions) &&
                    parsedRecipe.instructions
                      .map((instruction, index) => {
                        // Safely convert instruction to string (handle objects, null, undefined)
                        let instructionText = '';
                        
                        if (typeof instruction === 'string') {
                          instructionText = instruction;
                        } else if (instruction === null || instruction === undefined) {
                          instructionText = '';
                        } else if (typeof instruction === 'object' && instruction !== null) {
                          // Handle object with text property (common in JSON-LD format)
                          const instructionObj = instruction as Record<string, unknown>;
                          if ('text' in instructionObj && typeof instructionObj.text === 'string') {
                            instructionText = instructionObj.text;
                          } else if ('name' in instructionObj && typeof instructionObj.name === 'string') {
                            // Some formats use 'name' instead of 'text'
                            instructionText = instructionObj.name;
                          } else {
                            // If it's an object we can't parse, skip it (don't show [object Object])
                            instructionText = '';
                          }
                        } else {
                          instructionText = String(instruction || '');
                        }
                        
                        return { index, text: instructionText };
                      })
                      .filter((item) => item.text.trim()) // Filter out empty instructions
                      .map((item, displayIndex) => (
                        <li key={item.index} className="flex items-start gap-3">
                          <span className="bg-[#FFBA25] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 font-albert">
                            {displayIndex + 1}
                          </span>
                          <span className="font-albert text-[16px] text-stone-950 leading-[1.4]">
                            {item.text}
                          </span>
                        </li>
                      ))}
                </ol>
              </div>
            </Tabs.Content>

            {/* Plate Tab Content */}
            <Tabs.Content value="plate" className="space-y-6">
              <div className="bg-stone-100 rounded-lg p-6">
                <h2 className="font-domine text-[20px] text-stone-950 mb-6 leading-[1.1]">
                  Plate & Serve
                </h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="font-albert text-[18px] text-stone-600">
                    Coming soon...
                  </p>
                  <p className="font-albert text-[14px] text-stone-600 mt-2">
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
