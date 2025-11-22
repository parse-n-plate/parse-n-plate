'use client';
import { useState } from 'react';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function RecentRecipesList() {
  const { recentRecipes, getRecipeById, clearRecipes } = useParsedRecipes();
  const { setParsedRecipe } = useRecipe();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Get the 3 most recent recipes
  const displayRecipes = recentRecipes.slice(0, 3);

  // Handle clearing all recipes with confirmation
  const handleClearRecipes = () => {
    // Call the clearRecipes function from context
    clearRecipes();
    // Close the dialog
    setOpen(false);
  };

  const handleRecipeClick = (recipeId: string) => {
    try {
      // Get the full recipe data from storage
      const fullRecipe = getRecipeById(recipeId);

      if (fullRecipe && fullRecipe.ingredients && fullRecipe.instructions) {
        // Only include sourceUrl if it exists and doesn't start with "image:" (image-based recipes)
        const sourceUrl = fullRecipe.url && !fullRecipe.url.startsWith('image:') ? fullRecipe.url : undefined;
        
        // Load the recipe into the RecipeContext for the parsed recipe page
        setParsedRecipe({
          title: fullRecipe.title,
          ingredients: fullRecipe.ingredients,
          instructions: fullRecipe.instructions,
          sourceUrl: sourceUrl,
          // Note: datePublished is not stored in localStorage ParsedRecipe type,
          // so we can't restore it from saved recipes
        });

        // Navigate to the parsed recipe page
        router.push('/parsed-recipe-page');
      } else {
        console.error('Recipe data not found or incomplete:', fullRecipe);
        // You could show an error message here if needed
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  };

  if (displayRecipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-albert text-[16px] text-[#757575]">
          No recent recipes yet.
        </p>
        <p className="font-albert text-[14px] text-[#757575] mt-2">
          Parse your first recipe to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Recipe buttons */}
      <div className="flex flex-wrap gap-2">
        {displayRecipes.map((recipe) => (
          <button
            key={recipe.id}
            className="
              bg-black text-white font-albert text-[14.495px] leading-[23.889px]
              px-4 py-3 rounded-[26.842px] 
              hover:bg-gray-800 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50
            "
            onClick={() => handleRecipeClick(recipe.id)}
          >
            {recipe.title}
          </button>
        ))}
      </div>

      {/* Clear All button with Alert Dialog - only show if there are recipes */}
      {recentRecipes.length > 0 && (
        <div className="pt-2">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-albert text-[12px] text-[#757575] hover:text-[#1e1e1e]"
              >
                Clear all recipes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-domine text-[18px] text-stone-950">
                  Clear all recipes?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-albert text-[14px] text-stone-600">
                  Are you sure you want to clear all parsed recipes? This action
                  cannot be undone. All your saved recipes will be permanently
                  removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-albert">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearRecipes}
                  className="bg-destructive text-white hover:bg-destructive/90 font-albert"
                >
                  Clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
