import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParsedRecipes } from "@/contexts/ParsedRecipesContext";
import { formatRelativeTime } from "@/lib/utils";

export default function RecentRecipesList() {
  const { recentRecipes, clearRecipes } = useParsedRecipes();
  
  // Get the 3 most recent recipes
  const displayRecipes = recentRecipes.slice(0, 3);

  // Debug: Log the recipes to console
  console.log('RecentRecipesList - recentRecipes:', recentRecipes);
  console.log('RecentRecipesList - displayRecipes:', displayRecipes);

  if (displayRecipes.length === 0) {
    return (
        <div className="text-center py-8">
        <p className="font-albert text-[16px] text-[#757575]">No recent recipes yet.</p>
        <p className="font-albert text-[14px] text-[#757575] mt-2">
            Parse your first recipe to see it here!
          </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayRecipes.map((recipe) => (
        <div
          key={recipe.id}
          className="bg-white rounded-lg border border-[#d9d9d9] p-6 hover:shadow-md transition-shadow"
        >
          <div className="space-y-2">
            <h3 className="font-albert text-[16px] text-[#1e1e1e] leading-[1.4]">
              {recipe.title}
            </h3>
            <p className="font-albert text-[16px] text-[#757575] leading-[1.4]">
              {recipe.summary}
            </p>
      </div>
              </div>
        ))}
    </div>
  );
} 