'use client';

import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { RecipeStep } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface StepDisplayProps {
  step: RecipeStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onBackToList: () => void;
}

// Helper function to extract and bold keywords in text
const formatStepText = (text: string): JSX.Element => {
  // Enhanced keyword list for cooking
  const keywords = [
    'overnight', 'carefully', 'gently', 'slowly', 'quickly', 
    'boil', 'simmer', 'sauté', 'whisk', 'fold', 'knead',
    'golden brown', 'tender', 'fragrant', 'smooth'
  ];
  let formattedText = text;
  
  // Replace keywords with bold version (temporary marker)
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formattedText = formattedText.replace(regex, (match) => `**${match}**`);
  });

  const parts = formattedText.split('**');
  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = keywords.some(kw => part.toLowerCase() === kw.toLowerCase());
        if (isKeyword) {
          return (
            <motion.span 
              key={index} 
              initial={{ color: "#193d34" }}
              whileHover={{ color: "#ff6f00" }}
              className="font-bold underline decoration-stone-200 underline-offset-4 transition-colors cursor-help"
            >
              {part}
            </motion.span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function StepDisplay({ step, currentStep, totalSteps, onNext, onPrev, onBackToList }: StepDisplayProps) {
  return (
    <div className="shrink-0 bg-white p-8 relative overflow-hidden">
      <div className="flex flex-col gap-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            disabled={currentStep === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 bg-stone-50 border border-stone-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-stone-50 disabled:shadow-none transition-all"
            aria-label="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex flex-col items-center">
            <button
              onClick={onBackToList}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-stone-50 transition-colors group"
              aria-label="Back to list view"
            >
              <List className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
              <span className="font-albert font-bold text-[13px] uppercase tracking-widest text-stone-400 group-hover:text-stone-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </button>
          </div>
          
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 bg-stone-50 border border-stone-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-stone-50 disabled:shadow-none transition-all"
            aria-label="Next Step"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-domine text-[36px] md:text-[42px] text-[#193d34] leading-tight font-bold">
              {step.step}
            </h2>
            <p className="font-albert text-[19px] text-[#193d34]/80 leading-relaxed max-w-2xl">
              {formatStepText(step.detail)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
