'use client';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RecipeSkeleton from '@/components/ui/recipe-skeleton';
import * as Tabs from '@radix-ui/react-tabs';
import Link from 'next/link';
import { isEnhancedInstructions } from '@/utils/recipe-helpers';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Knife, CookingPot, ForkKnife } from '@phosphor-icons/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Helper function to format ingredient
const formatIngredient = (
  ingredient: string | { amount?: string; units?: string; ingredient: string },
): string => {
  // Handle string ingredients
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  // Handle null or undefined
  if (!ingredient || typeof ingredient !== 'object') {
    return 'Invalid ingredient';
  }

  // Handle object format with amount, units, and ingredient
  if (ingredient.ingredient) {
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

  // Fallback: try to extract any useful information from unexpected object structure
  if (ingredient.amount || ingredient.units) {
    const parts = [];
    if (ingredient.amount) parts.push(ingredient.amount);
    if (ingredient.units) parts.push(ingredient.units);
    return parts.join(' ') || 'Invalid ingredient';
  }

  // Last resort: return a safe error message instead of [object Object]
  console.warn('[formatIngredient] Unexpected ingredient format:', ingredient);
  return 'Invalid ingredient format';
};

export default function ParsedRecipePage() {
  const { parsedRecipe, isLoaded, setParsedRecipe } = useRecipe();
  const router = useRouter();
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    // Give a moment for context to load from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!parsedRecipe) {
        router.push('/');
      }
    }, 100);

  // Fetch images from source URL when recipe is loaded
  useEffect(() => {
    const fetchImages = async () => {
      // Only fetch if we have a sourceUrl and don't already have images
      if (
        parsedRecipe?.sourceUrl &&
        !parsedRecipe.imageUrls &&
        !imagesLoading
      ) {
        setImagesLoading(true);
        try {
          const response = await fetch('/api/extractImages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: parsedRecipe.sourceUrl }),
          });

          const data = await response.json();

          if (data.success && data.images && data.images.length > 0) {
            // Update the recipe with the fetched images
            setParsedRecipe({
              ...parsedRecipe,
              imageUrls: data.images,
            });
          }
        } catch (error) {
          console.error('[ParsedRecipePage] Error fetching images:', error);
        } finally {
          setImagesLoading(false);
        }
      }
    };

    fetchImages();
  }, [parsedRecipe?.sourceUrl, parsedRecipe?.imageUrls, imagesLoading, setParsedRecipe]);

  if (!isLoaded) {
    return <RecipeSkeleton />;
  }

  if (!parsedRecipe) {
    return <div className="p-4">No recipe data found. Redirecting...</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen relative max-w-full overflow-x-hidden">
      <div className="transition-opacity duration-300 ease-in-out opacity-100">
        {/* Breadcrumbs Navigation */}
        <div className="px-4 md:px-8 pt-8 pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="font-albert text-[14px] text-stone-600 hover:text-stone-900 transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-albert text-[14px] text-stone-900">
                  {parsedRecipe.title || 'Recipe'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Image Carousel - Only show if images are available */}
        {parsedRecipe.imageUrls && parsedRecipe.imageUrls.length > 0 && (
          <div className="px-4 md:px-8 pb-6">
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {parsedRecipe.imageUrls.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-stone-100">
                      <img
                        src={imageUrl}
                        alt={`${parsedRecipe.title || 'Recipe'} image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 md:left-4" />
              <CarouselNext className="right-2 md:right-4" />
            </Carousel>
          </div>
        )}

        {/* Hero Section */}
        <div className="px-4 md:px-8 pb-6">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-domine text-[40px] text-stone-950 leading-[1.1] mb-1">
              {parsedRecipe.title || 'Beef Udon'}
            </h1>
            <div className="flex flex-col gap-1.5">
              {/* Only show author if author data exists */}
              {parsedRecipe.author && (
                <div className="flex items-center">
                  <span className="font-albert text-[14px] text-stone-700 leading-[1.4]">
                    {parsedRecipe.author}
                  </span>
                </div>
              )}
              {/* Show publication date if available */}
              {parsedRecipe.datePublished && (
                <div className="flex items-center">
                  <span className="font-albert text-[14px] text-stone-600 leading-[1.4]">
                    Published {new Date(parsedRecipe.datePublished).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {/* Only show source link if sourceUrl exists (not for image-based recipes) */}
              {parsedRecipe.sourceUrl && (
                <div className="flex items-center">
                  <a
                    href={parsedRecipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-albert text-[14px] text-stone-600 hover:text-stone-900 underline transition-colors"
                  >
                    View Source
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-8 pb-8 space-y-6">
          {/* Tabs Section */}
          <Tabs.Root defaultValue="prep" className="w-full">
            {/* Tab List - Updated to match Figma design */}
            <Tabs.List className="flex gap-0 items-center justify-start mb-6 bg-stone-100 rounded-lg p-1">
              <Tabs.Trigger
                value="prep"
                className="flex-1 bg-transparent rounded-md px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-stone-700 transition-all duration-200"
              >
                <Knife 
                  className="w-5 h-5 text-current" 
                  weight="regular"
                />
                <span className="font-albert font-semibold text-[15px]">
                  Prep
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="cook"
                className="flex-1 bg-transparent rounded-md px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-stone-700 transition-all duration-200"
              >
                <CookingPot 
                  className="w-5 h-5 text-current" 
                  weight="regular"
                />
                <span className="font-albert font-semibold text-[15px]">
                  Cook
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="plate"
                className="flex-1 bg-transparent rounded-md px-4 py-3 flex items-center justify-center gap-2 data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-stone-700 transition-all duration-200"
              >
                <ForkKnife 
                  className="w-5 h-5 text-current" 
                  weight="regular"
                />
                <span className="font-albert font-semibold text-[15px]">
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
                    parsedRecipe.instructions.map((instruction, index) => {
                      // Handle both string[] and RecipeStep[] formats
                      const instructionText = typeof instruction === 'string' 
                        ? instruction 
                        : instruction.instruction;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <span className="bg-[#FFBA25] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 font-albert">
                            {index + 1}
                          </span>
                          <span className="font-albert text-[16px] text-stone-950 leading-[1.4]">
                            {instructionText}
                          </span>
                        </li>
                      );
                    })}
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
