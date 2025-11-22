'use client';

import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import RecipeCard from './recipe-card';

interface TrendingRecipesSectionProps {
  category?: string;
  maxRecipes?: number;
}

export default function TrendingRecipesSection({
  category = 'Asian',
  maxRecipes = 6,
}: TrendingRecipesSectionProps) {
  const { recentRecipes } = useParsedRecipes();
  const { setParsedRecipe } = useRecipe();
  const router = useRouter();

  // Get recipes to display (for now, using recent recipes)
  // In a real app, you'd filter by category and get trending recipes
  const displayRecipes = recentRecipes.slice(0, maxRecipes);

  // Handle recipe card click
  const handleRecipeClick = (recipeId: string) => {
    try {
      // Get the full recipe data from storage
      const fullRecipe = recentRecipes.find((r) => r.id === recipeId);

      if (fullRecipe && fullRecipe.ingredients && fullRecipe.instructions) {
        // Load the recipe into the RecipeContext for the parsed recipe page
        setParsedRecipe({
          title: fullRecipe.title,
          ingredients: fullRecipe.ingredients,
          instructions: fullRecipe.instructions,
        });

        // Navigate to the parsed recipe page
        router.push('/parsed-recipe-page');
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  if (displayRecipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-albert text-[16px] text-stone-600">
          No recipes yet. Parse your first recipe to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h2 className="font-domine text-[32px] text-black leading-none">
          Trending Recipes
        </h2>
      </div>

      {/* Category Subtitle */}
      <div className="flex items-center gap-2">
        <h3 className="font-albert text-[18px] text-black font-medium">
          {category}
        </h3>
        <span className="text-[18px]">🍅</span>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}

