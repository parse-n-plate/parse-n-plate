'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  ingredientsNeeded?: string[];
  toolsNeeded?: string[];
  timerMinutes?: number;
  timerLabel?: string;
  tips?: string;
}

export interface ParsedRecipe {
  title?: string;
  description?: string;          // NEW: Recipe description
  imageUrl?: string;              // NEW: Recipe image URL
  imageUrls?: string[];           // NEW: Array of recipe images for carousel
  author?: string;                // NEW: Recipe author/source
  sourceUrl?: string;             // NEW: Original source URL (for linking back)
  datePublished?: string;          // NEW: Publication date from recipe page (ISO date string)
  cookTimeMinutes?: number;       // NEW: Cook time in minutes
  prepTimeMinutes?: number;       // NEW: Prep time in minutes
  totalTimeMinutes?: number;      // NEW: Total time in minutes
  servings?: number;             // NEW: Number of servings
  cuisine?: string[];            // NEW: Cuisine types/tags
  rating?: number;               // NEW: Recipe rating (1-5)
  skills?: {                    // NEW: Required cooking skills
    techniques?: string[];      // Cooking techniques needed
    knifework?: string[];       // Knife skills needed
  };
  ingredients: {
    groupName: string;
    ingredients: { amount: string; units: string; ingredient: string }[];
  }[];
  instructions: string[] | RecipeStep[];
}

interface RecipeContextType {
  parsedRecipe: ParsedRecipe | null;
  setParsedRecipe: (recipe: ParsedRecipe | null) => void;
  clearRecipe: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('parsedRecipe');
    if (saved) {
      try {
        setParsedRecipe(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recipe from localStorage:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const setParsedRecipeWithStorage = (recipe: ParsedRecipe | null) => {
    setParsedRecipe(recipe);
    if (recipe) {
      localStorage.setItem('parsedRecipe', JSON.stringify(recipe));
    } else {
      localStorage.removeItem('parsedRecipe');
    }
  };

  const clearRecipe = () => {
    setParsedRecipe(null);
    localStorage.removeItem('parsedRecipe');
  };

  return (
    <RecipeContext.Provider
      value={{
        parsedRecipe,
        setParsedRecipe: setParsedRecipeWithStorage,
        clearRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}
