/**
 * Utility functions for parsing, scaling, and formatting ingredient amounts.
 */

// Unicode fraction mapping
const unicodeFractions: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

// Common decimal to fraction mapping for formatting
const decimalToFractionMap: Record<string, string> = {
  '0.5': '1/2',
  '0.33': '1/3',
  '0.333': '1/3',
  '0.66': '2/3',
  '0.666': '2/3',
  '0.67': '2/3',
  '0.25': '1/4',
  '0.75': '3/4',
  '0.2': '1/5',
  '0.4': '2/5',
  '0.6': '3/5',
  '0.8': '4/5',
  '0.166': '1/6',
  '0.167': '1/6',
  '0.833': '5/6',
  '0.125': '1/8',
  '0.375': '3/8',
  '0.625': '5/8',
  '0.875': '7/8',
};

/**
 * Parses a string amount into a number.
 * Handles:
 * - Whole numbers ("2")
 * - Decimals ("1.5")
 * - Fractions ("1/2", "2 1/2")
 * - Unicode fractions ("½", "1 ½")
 */
export function parseAmount(amountStr: string): number | null {
  if (!amountStr) return null;
  
  const cleanStr = amountStr.trim();
  if (!cleanStr) return null;

  // Check for range (e.g., "2-3") - return null as we handle ranges differently
  if (cleanStr.includes('-') || cleanStr.toLowerCase().includes(' to ')) {
    return null;
  }

  // Check for unicode fractions
  let value = 0;
  let hasUnicode = false;
  
  for (const [char, val] of Object.entries(unicodeFractions)) {
    if (cleanStr.includes(char)) {
      const parts = cleanStr.split(char);
      if (parts[0].trim()) {
        value += parseFloat(parts[0].trim());
      }
      value += val;
      hasUnicode = true;
      break;
    }
  }
  
  if (hasUnicode) return isNaN(value) ? null : value;

  // Handle "1 1/2" or "1/2" format
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split(' ');
    let total = 0;
    
    for (const part of parts) {
      if (part.includes('/')) {
        const [num, den] = part.split('/').map(Number);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          total += num / den;
        }
      } else if (part.trim()) {
        const val = parseFloat(part);
        if (!isNaN(val)) {
          total += val;
        }
      }
    }
    return total > 0 ? total : null;
  }

  // Handle standard numbers/decimals
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Formats a number back into a readable string, preferring fractions.
 */
export function formatAmount(value: number): string {
  // Handle very small numbers or 0
  if (value <= 0.01) return '';

  // Check for whole numbers
  if (Math.abs(value % 1) < 0.01) {
    return Math.round(value).toString();
  }

  const wholePart = Math.floor(value);
  const decimalPart = value - wholePart;
  
  // Try to match decimal part to known fraction
  let fractionStr = '';
  let bestDiff = 0.02; // Tolerance for matching

  for (const [decStr, frac] of Object.entries(decimalToFractionMap)) {
    const dec = parseFloat(decStr);
    if (Math.abs(decimalPart - dec) < bestDiff) {
      fractionStr = frac;
      bestDiff = Math.abs(decimalPart - dec);
    }
  }

  if (fractionStr) {
    return wholePart > 0 ? `${wholePart} ${fractionStr}` : fractionStr;
  }

  // Fallback to decimal formatting (max 2 decimal places)
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Scales a single ingredient amount string based on the servings ratio.
 */
export function scaleAmountString(amountStr: string, ratio: number): string {
  if (!amountStr || !amountStr.trim()) return amountStr;
  if (ratio === 1) return amountStr;

  // Handle ranges (e.g., "2-3")
  if (amountStr.includes('-')) {
    const parts = amountStr.split('-');
    if (parts.length === 2) {
      const start = parseAmount(parts[0]);
      const end = parseAmount(parts[1]);
      
      if (start !== null && end !== null) {
        return `${formatAmount(start * ratio)}-${formatAmount(end * ratio)}`;
      }
    }
  }
  
  // Handle "2 to 3" format
  if (amountStr.toLowerCase().includes(' to ')) {
    const parts = amountStr.toLowerCase().split(' to ');
    if (parts.length === 2) {
      const start = parseAmount(parts[0]);
      const end = parseAmount(parts[1]);
      
      if (start !== null && end !== null) {
        return `${formatAmount(start * ratio)} to ${formatAmount(end * ratio)}`;
      }
    }
  }

  // Handle single amount
  const val = parseAmount(amountStr);
  if (val !== null) {
    return formatAmount(val * ratio);
  }

  // Return original if parsing failed (e.g., "pinch", "handful")
  return amountStr;
}

export interface Ingredient {
  amount?: string;
  units?: string;
  ingredient: string;
}

export interface IngredientGroup {
  groupName: string;
  ingredients: (string | Ingredient)[];
}

/**
 * Scales an entire ingredient object or string.
 */
export function scaleIngredient(
  ingredient: string | Ingredient,
  ratio: number
): string | Ingredient {
  if (typeof ingredient === 'string') return ingredient;
  if (!ingredient.amount) return ingredient;

  return {
    ...ingredient,
    amount: scaleAmountString(ingredient.amount, ratio),
  };
}

