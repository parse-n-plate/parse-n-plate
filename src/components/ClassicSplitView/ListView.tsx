'use client';

import { RecipeStep } from './types';

interface ListViewProps {
  steps: RecipeStep[];
  onSelectStep: (index: number) => void;
}

export default function ListView({ steps, onSelectStep }: ListViewProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="font-albert text-stone-500">No steps available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-white">
      <div className="space-y-4 pb-12">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onSelectStep(index)}
            className="w-full bg-white border border-[#e7e5e4] rounded-[18px] p-[20px] text-left hover:border-stone-300 hover:bg-stone-50/30 transition-all group relative overflow-hidden"
          >
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-3">
                {/* Number Badge - Changes color on hover */}
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 group-hover:bg-[#193d34] group-hover:text-white transition-colors duration-300">
                  <span className="font-albert font-bold text-[11px] leading-none">
                    {index + 1}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="font-domine font-bold text-[18px] text-[#193d34] leading-tight flex-1 min-w-0">
                  {step.step}
                </h3>
              </div>
              
              {/* Step Description */}
              <p className="font-albert text-[16px] text-stone-500 leading-relaxed pl-10">
                {step.detail}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
