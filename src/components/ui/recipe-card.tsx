'use client';

import Image from 'next/image';

export interface RecipeCardData {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  cuisine?: string;
}

interface RecipeCardProps {
  recipe: RecipeCardData;
  onClick?: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // All cards use white background (matching updated design)
  
  return (
    <div
      className="group w-full md:basis-0 md:grow min-h-px md:min-w-px relative rounded-[8px] shrink-0 bg-white transition-all hover:rounded-[24px] cursor-pointer"
    >
      {/* Animated border that matches the rounded corners on hover */}
      <div
        aria-hidden="true"
        className="absolute border border-solid border-stone-200 inset-0 pointer-events-none rounded-[8px] transition-all group-hover:rounded-[24px]"
      />
      
      <div className="size-full">
        <button
          onClick={onClick}
          className="w-full h-full focus:outline-none focus:ring-2 focus:ring-[#FFA423] focus:ring-offset-2 rounded-[inherit]"
        >
          <div className="box-border content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
            {/* Recipe Image */}
            <div className="aspect-[282.667/204] relative rounded-[8px] shrink-0 w-full overflow-hidden">
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[8px] size-full transition-transform hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center rounded-[8px]">
                  <span className="text-stone-500 font-albert text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="content-stretch flex flex-col font-normal gap-[4px] items-start justify-center overflow-clip relative shrink-0 text-nowrap w-full whitespace-pre">
              <h3 className="font-domine leading-[1.1] relative shrink-0 text-[24px] text-black">
                {recipe.title}
              </h3>
              <p className="font-albert leading-[1.4] relative shrink-0 text-[14px] text-stone-900">
                <span>By </span>
                {recipe.author}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

