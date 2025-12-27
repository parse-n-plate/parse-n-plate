'use client';

import HomepageSkeleton from '@/components/ui/homepage-skeleton';
import CuisinePills from '@/components/ui/cuisine-pills';
import RecipeCard, { RecipeCardData } from '@/components/ui/recipe-card';
import { useState, useEffect, useMemo, Suspense, use } from 'react';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';
import { useRouter } from 'next/navigation';
import type { CuisineType } from '@/components/ui/cuisine-pills';

function HomeContent() {
  const {
    isLoaded,
    recentRecipes,
    getRecipeById,
    removeRecipe,
  } = useParsedRecipes();
  const { settings } = useAdminSettings();
  const { setParsedRecipe } = useRecipe();
  const router = useRouter();
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('All');
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);

  // Trigger onload animation when component mounts and data is loaded
  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure smooth animation start
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleCuisineChange = (cuisine: CuisineType) => {
    setSelectedCuisine(cuisine);
  };

  // Handle recent recipe click - navigate to parsed recipe page
  const handleRecentRecipeClick = (recipeId: string) => {
    try {
      const fullRecipe = getRecipeById(recipeId);
      if (fullRecipe && fullRecipe.ingredients && fullRecipe.instructions) {
        setParsedRecipe({
          title: fullRecipe.title,
          ingredients: fullRecipe.ingredients,
          instructions: fullRecipe.instructions,
          author: fullRecipe.author, // Include author if available
          sourceUrl: fullRecipe.sourceUrl || fullRecipe.url, // Include source URL if available
          summary: fullRecipe.description || fullRecipe.summary, // Use AI summary if available, fallback to card summary
          cuisine: fullRecipe.cuisine, // Include cuisine tags if available
        });
        router.push('/parsed-recipe-page');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  const handleRemoveRecentRecipe = (recipeId: string) => {
    removeRecipe(recipeId);
  };

  // Convert ParsedRecipe to RecipeCardData format
  const convertToRecipeCardData = (recipe: typeof recentRecipes[0]): RecipeCardData => {
    // Extract domain name from URL as a simple "author" placeholder
    let author = 'Recipe';
    try {
      if (recipe.url) {
        const urlObj = new URL(recipe.url);
        author = urlObj.hostname.replace('www.', '').split('.')[0];
        // Capitalize first letter
        author = author.charAt(0).toUpperCase() + author.slice(1);
      }
    } catch {
      // If URL parsing fails, use default
    }

    return {
      id: recipe.id,
      title: recipe.title,
      author: author,
      imageUrl: recipe.imageUrl, // Optional image support when available
      cuisine: recipe.cuisine, // Include cuisine tags if available
    };
  };

  // Get recent recipes for display (limit to 6 most recent)
  const displayRecentRecipes = recentRecipes.slice(0, 6).map(convertToRecipeCardData);

  // Filter recipes by selected cuisine
  const filteredRecipes = useMemo(() => {
    console.log('[Homepage] 🍽️ Filtering recipes by cuisine:', selectedCuisine);
    console.log('[Homepage] Available recipes:', displayRecentRecipes.map(r => ({ title: r.title, cuisine: r.cuisine })));
    
    if (selectedCuisine === 'All') {
      console.log('[Homepage] Showing all recipes (All selected)');
      return displayRecentRecipes;
    }
    
    const filtered = displayRecentRecipes.filter(recipe => {
      const hasMatchingCuisine = recipe.cuisine && recipe.cuisine.includes(selectedCuisine);
      console.log(`[Homepage] Recipe "${recipe.title}": cuisine=${recipe.cuisine}, matches=${hasMatchingCuisine}`);
      return hasMatchingCuisine;
    });
    
    console.log('[Homepage] Filtered results:', filtered.length, 'recipes match', selectedCuisine);
    return filtered;
  }, [selectedCuisine, displayRecentRecipes]);

  if (!isLoaded) {
    return <HomepageSkeleton />;
  }

  return (
    <div className="bg-white min-h-screen relative flex flex-col">

      <div className="transition-opacity duration-300 ease-in-out opacity-100 relative z-10 flex-1">
        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16 flex flex-col gap-16 md:gap-20">
          {/* Hero Section */}
          <div className={`text-center space-y-5 md:space-y-6 ${isPageLoaded ? 'page-fade-in-up' : 'opacity-0'}`}>
              <h1 className="font-domine text-[48px] md:text-[56px] font-normal text-black leading-[1.05]">
                Clean recipes, calm cooking.
              </h1>
              <>
    <p className="font-albert text-[16px] md:text-[17px] text-stone-600 leading-[1.6] max-w-2xl mx-auto">
        No distractions. No clutter. Just clear, elegant recipes designed<span className="responsive-break"></span> for people who love to cook.
    </p>
</>
          </div>

          {/* Recent Recipes Section */}
          {displayRecentRecipes.length > 0 && (
            <div className={`space-y-8 md:space-y-10 ${isPageLoaded ? 'page-fade-in-up page-fade-delay-1' : 'opacity-0'}`}>
              <div className="space-y-4 md:space-y-5">
                {/* Header */}
                <div>
                  <h2 className="font-domine text-[28px] md:text-[24px] font-normal text-black leading-[1.1] tracking-tight">
                    Recent Recipes
                  </h2>
                </div>
                <p className="font-albert text-[15px] md:text-[16px] text-stone-500 leading-[1.5]">
                  Fresh pulls from your kitchen queue
                </p>
              </div>

              {/* Recent Recipe Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRecentRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showImage={settings.showRecentRecipeImages}
                    onClick={() => handleRecentRecipeClick(recipe.id)}
                    showDelete
                    onDelete={() => handleRemoveRecentRecipe(recipe.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trending Recipes Section */}
          <div className={`space-y-8 md:space-y-10 ${isPageLoaded ? 'page-fade-in-up page-fade-delay-2' : 'opacity-0'}`}>
            <div className="space-y-4 md:space-y-5">
              <h2 className="font-domine text-[28px] md:text-[24px] font-normal text-black leading-[1.1] tracking-tight">
                Trending Recipes
              </h2>
            </div>

            {/* Cuisine Filter Pills now sit below the Trending header */}
            <div className="mb-6 md:mb-8">
              <CuisinePills onCuisineChange={handleCuisineChange} />
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* Show message if no recipes match filter (but only if there are recipes available) */}
            {filteredRecipes.length === 0 && displayRecentRecipes.length > 0 && (
              <div className="text-center py-12">
                <p className="font-albert text-[16px] text-stone-600">
                  No recipes found for {selectedCuisine === 'All' ? 'this filter' : selectedCuisine}
                </p>
              </div>
            )}
            
            {/* Show message if no recipes at all */}
            {displayRecentRecipes.length === 0 && (
              <div className="text-center py-12">
                <p className="font-albert text-[16px] text-stone-600">
                  No recipes yet. Parse your first recipe to see it here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({
  params,
  searchParams,
}: {
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[]>>;
} = {} as any) {
  // For Next.js 15: Unwrap params/searchParams if provided to prevent enumeration warnings
  // This prevents React DevTools/error serialization from enumerating these props
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (params) use(params);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (searchParams) use(searchParams);
  
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
