'use client';

import Image from 'next/image';
import { ParsedRecipe } from '@/lib/storage';

interface RecipeCardProps {
  recipe: ParsedRecipe;
  onClick?: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Generate a placeholder image URL based on recipe title
  // In a real app, you'd use the actual recipe image URL from the parsed recipe data
  // For now, we use a food placeholder image
  const getImageUrl = () => {
    // Using a food-related placeholder image
    // In production, you'd fetch the actual recipe image from the source URL
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;
  };

  return (
    <button
      onClick={onClick}
      className="
        w-full bg-stone-800 rounded-lg overflow-hidden
        hover:opacity-90 transition-opacity duration-200
        focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2
        group
      "
    >
      {/* Recipe Image */}
      <div className="relative w-full aspect-[4/3] bg-stone-700 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Recipe Info */}
      <div className="p-4 text-left">
        <h3 className="font-albert font-medium text-white text-[16px] leading-tight mb-1 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="font-albert text-stone-400 text-[14px]">
          {recipe.url && recipe.url.startsWith('http')
            ? `By ${new URL(recipe.url).hostname.replace('www.', '')}`
            : recipe.url && recipe.url.startsWith('image:')
            ? 'From Image'
            : 'Unknown'}
        </p>
      </div>
    </button>
  );
}

