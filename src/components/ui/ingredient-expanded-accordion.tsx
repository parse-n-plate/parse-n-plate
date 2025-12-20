'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IngredientExpandedContent } from './ingredient-expanded-content';

interface IngredientExpandedAccordionProps {
  ingredientName: string;
  ingredientAmount?: string;
  description?: string;
  linkedSteps: number[];
  onStepClick: (stepNumber: number) => void;
  isOpen: boolean;
}

export function IngredientExpandedAccordion({
  ingredientName,
  ingredientAmount,
  description,
  linkedSteps,
  onStepClick,
  isOpen
}: IngredientExpandedAccordionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden bg-white/50"
    >
      <div className="pt-2 pb-4 px-12 border-t border-stone-50">
        <IngredientExpandedContent
          ingredientName={ingredientName}
          ingredientAmount={ingredientAmount}
          description={description}
          linkedSteps={linkedSteps}
          onStepClick={onStepClick}
          variant="accordion"
        />
      </div>
    </motion.div>
  );
}

