'use client';

import { MockRecipe } from '@/lib/mockRecipeData';
import Image from 'next/image';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: MockRecipe;
  className?: string;
}

/**
 * RecipeCard Component
 * 
 * Displays a single recipe card with:
 * - Recipe image
 * - Recipe name (title)
 * - Author name
 * 
 * Includes hover effects for better interactivity.
 * 
 * @param recipe - The recipe data to display
 * @param className - Optional additional CSS classes
 */
export default function RecipeCard({ recipe, className = '' }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`
        group w-full md:basis-0 md:grow min-h-px md:min-w-px
        relative rounded-lg shrink-0 bg-white
        transition-all duration-300 hover:rounded-3xl
        cursor-pointer border border-stone-200
        ${className}
      `}
    >
      <div className="size-full">
        <div className="flex flex-col gap-6 items-start p-6 w-full">
          {/* Recipe Image */}
          <div className="aspect-[282.667/204] relative rounded-lg shrink-0 w-full overflow-hidden bg-stone-100">
            {!imageError ? (
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              // Fallback when image fails to load
              <div className="w-full h-full flex items-center justify-center bg-stone-200 rounded-lg">
                <span className="text-stone-400 text-4xl">🍳</span>
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex flex-col gap-1 items-start justify-center w-full">
            {/* Recipe Name */}
            <h3 className="font-domine leading-[1.1] text-[24px] text-black">
              {recipe.name}
            </h3>

            {/* Author */}
            <p className="font-albert leading-[1.4] text-[14px] text-stone-900">
              By {recipe.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

