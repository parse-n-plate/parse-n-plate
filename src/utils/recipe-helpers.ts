import { RecipeStep } from '@/contexts/RecipeContext';

// Helper to check if instructions are in new format
export function isEnhancedInstructions(instructions: string[] | RecipeStep[]): instructions is RecipeStep[] {
  return instructions.length > 0 && typeof instructions[0] === 'object';
}

// Convert old format to new format (for migration)
export function migrateInstructionsToSteps(instructions: string[]): RecipeStep[] {
  return instructions.map((instruction, index) => ({
    stepNumber: index + 1,
    instruction,
    ingredientsNeeded: [],
    toolsNeeded: [],
  }));
}

