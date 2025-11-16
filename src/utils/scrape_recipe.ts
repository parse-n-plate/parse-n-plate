/**
 * Universal recipe scraper for Node.js using Cheerio
 * Ported from Python version to work with Vercel serverless functions
 * 
 * This scraper uses a multi-layered approach:
 * 1. JSON-LD structured data extraction (fastest, most reliable)
 * 2. Comprehensive HTML selector fallbacks (works with most recipe sites)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Interface for recipe data structure
 */
export interface RecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
}

/**
 * Interface for error response
 */
export interface RecipeError {
  error: string;
}

/**
 * Main recipe parsing function
 * @param url - The recipe URL to scrape
 * @returns Promise with recipe data or error
 */
export async function parseRecipe(
  url: string,
): Promise<RecipeData | RecipeError> {
  try {
    console.log(`Starting recipe parsing for: ${url}`);

    // Fetch the HTML content with proper headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
      },
      timeout: 10000, // 10 second timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);

    console.log(`Successfully fetched HTML from ${url}`);

    // Try JSON-LD structured data first (Layer 1)
    const jsonLdResult = extractFromJsonLd($);
    if (jsonLdResult) {
      console.log(
        `Layer 1 SUCCESS: Found recipe via JSON-LD with ${jsonLdResult.ingredients.length} ingredients and ${jsonLdResult.instructions.length} instructions`,
      );
      return jsonLdResult;
    }

    console.log('Layer 1 (JSON-LD) failed, trying HTML selectors...');

    // Fall back to HTML selector parsing (Layer 2)
    const title = extractTitle($);
    const ingredients = extractIngredients($);
    const instructions = extractInstructions($);

    console.log(
      `Layer 2 results: title='${title}', ingredients=${ingredients.length}, instructions=${instructions.length}`,
    );

    // Validate we got meaningful data
    if (
      title &&
      ingredients.length > 0 &&
      instructions.length > 0 &&
      title.length > 3
    ) {
      const result: RecipeData = {
        title,
        ingredients,
        instructions,
      };
      console.log(
        `Layer 2 SUCCESS: Found recipe with ${ingredients.length} ingredients and ${instructions.length} instructions`,
      );
      return result;
    } else {
      throw new Error(
        `Failed to extract complete recipe data: title='${title}', ingredients=${ingredients.length}, instructions=${instructions.length}`,
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Recipe scraping failed: ${errorMessage}`);
    return {
      error: `Failed to scrape recipe from ${url}: ${errorMessage}`,
    };
  }
}

/**
 * Extract recipe data from JSON-LD structured data
 * This is the most reliable method when available
 */
function extractFromJsonLd($: cheerio.CheerioAPI): RecipeData | null {
  try {
    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      try {
        const scriptContent = $(scripts[i]).html();
        if (!scriptContent) continue;

        const data = JSON.parse(scriptContent);

        // Handle both single objects and arrays of objects
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // Look for Recipe type or items with recipe data
          if (
            item['@type'] === 'Recipe' ||
            (item['@graph'] &&
              Array.isArray(item['@graph']) &&
              item['@graph'].some((g: any) => g['@type'] === 'Recipe'))
          ) {
            // If it's in @graph, find the Recipe object
            const recipe =
              item['@type'] === 'Recipe'
                ? item
                : item['@graph'].find((g: any) => g['@type'] === 'Recipe');

            if (!recipe) continue;

            const title = recipe.name || '';
            const ingredients: string[] = Array.isArray(recipe.recipeIngredient)
              ? recipe.recipeIngredient.filter(
                  (ing: any) => typeof ing === 'string' && ing.trim(),
                )
              : [];

            let instructions: string[] = [];

            // Handle different instruction formats
            if (Array.isArray(recipe.recipeInstructions)) {
              instructions = recipe.recipeInstructions
                .map((inst: any) => {
                  if (typeof inst === 'string') return inst.trim();
                  if (inst.text && typeof inst.text === 'string')
                    return inst.text.trim();
                  if (
                    inst['@type'] === 'HowToStep' &&
                    inst.text &&
                    typeof inst.text === 'string'
                  )
                    return inst.text.trim();
                  return '';
                })
                .filter((text: string) => text.length > 10);
            } else if (
              typeof recipe.recipeInstructions === 'string' &&
              recipe.recipeInstructions.trim()
            ) {
              // Split string instructions by newlines or periods
              instructions = recipe.recipeInstructions
                .split(/\n+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 10);
            }

            // Validate we have complete data
            if (
              title &&
              title.length > 3 &&
              ingredients.length > 0 &&
              instructions.length > 0
            ) {
              console.log(
                `Found recipe in JSON-LD: "${title}" with ${ingredients.length} ingredients and ${instructions.length} instructions`,
              );
              return { title, ingredients, instructions };
            }
          }
        }
      } catch (e) {
        // Continue to next script tag if this one fails
        continue;
      }
    }
  } catch (error) {
    console.error('Error parsing JSON-LD:', error);
  }

  return null;
}

/**
 * Extract recipe title using comprehensive selectors
 */
function extractTitle($: cheerio.CheerioAPI): string {
  // Comprehensive list of title selectors used by different recipe websites
  const titleSelectors = [
    // Schema.org structured data
    'h1[itemprop="name"]',
    '[itemprop="name"]',

    // Just One Cookbook specific
    '.entry-title',
    '.post-title',
    'h1.entry-title',
    '.recipe-header h1',
    '.single-post h1',
    '.post-header h1',
    '.entry-header h1',

    // Common recipe title classes
    '.recipe-title',
    '.recipe-name',
    '.recipe-header h1',
    '.recipe-header h2',
    '.recipe-heading',
    '.recipe-name-title',

    // WordPress Recipe Plugin (WP Recipe Maker)
    '.wprm-recipe-name',
    '.wprm-recipe-title',

    // AllRecipes specific
    'h1[data-testid="recipe-title"]',
    '[data-testid="recipe-title"]',

    // Food Network
    '.recipe-title',

    // BBC Good Food
    '.recipe-header__title',

    // Serious Eats
    '.entry-title',

    // Generic fallbacks
    'h1',
    '.title',
    '.heading',
    '[class*="title"]',
    '[class*="heading"]',
  ];

  for (const selector of titleSelectors) {
    try {
      const element = $(selector).first();
      if (element.length > 0) {
        const title = element.text().trim();
        // Filter out navigation elements
        if (
          title &&
          title.length > 3 &&
          !title.toLowerCase().startsWith('skip to') &&
          !title.toLowerCase().startsWith('jump to')
        ) {
          console.log(`Found title with selector '${selector}': ${title}`);
          return title;
        }
      }
    } catch (error) {
      continue;
    }
  }

  console.log('No title found with any selector');
  return '';
}

/**
 * Extract ingredients using comprehensive selectors
 */
function extractIngredients($: cheerio.CheerioAPI): string[] {
  const ingredients: string[] = [];

  // Comprehensive list of ingredient selectors
  const ingredientSelectors = [
    // Schema.org structured data
    '[itemprop="ingredients"]',
    '[itemprop="recipeIngredient"]',

    // AllRecipes specific (prioritize)
    '[data-testid="ingredient-item"]',
    '.ingredients-item-name',
    
    // Just One Cookbook specific
    '.recipe-ingredients li',
    '.ingredients li',
    '.recipe-ingredients-list li',
    '.ingredients-list li',
    '.recipe-ingredient',
    '.ingredient-item',

    // WordPress Recipe Plugin (WP Recipe Maker)
    '.wprm-recipe-ingredients-container li.wprm-recipe-ingredient',
    '.wprm-recipe-ingredient',
    '.wprm-recipe-ingredients li',

    // Food Network
    '.recipe-ingredients li',
    '.ingredients li',

    // BBC Good Food
    '.recipe-ingredients__list li',

    // Serious Eats
    '.recipe-ingredients li',

    // Generic ingredient patterns
    '[class*="ingredient"] li',
    'li[class*="ingredient"]',
    '.ingredients li',
    '.recipe-ingredients li',
    '.recipe-ingredients-list li',
  ];

  for (const selector of ingredientSelectors) {
    try {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `Found ${elements.length} potential ingredients with selector '${selector}'`,
        );

        elements.each((_, element) => {
          const $element = $(element);
          
          // Remove any img, script, style tags before extracting text
          $element.find('img').remove();
          $element.find('script').remove();
          $element.find('style').remove();
          $element.find('svg').remove();
          
          let text = $element.text().trim();
          
          // Filter out section headers (like "For the sauce:", "Ingredients:")
          if (text.toLowerCase() === 'ingredients' || 
              text.toLowerCase() === 'for the' ||
              /^[A-Z\s]+:$/.test(text)) {
            return; // continue to next element
          }
          
          // Filter out very short text
          if (text && text.length > 2) {
            // Normalize whitespace
            text = text.replace(/\s+/g, ' ').trim();
            
            // Remove any remaining HTML tags
            text = text.replace(/<[^>]*>/g, '');
            
            // Don't add duplicates
            if (!ingredients.includes(text)) {
              ingredients.push(text);
            }
          }
        });

        if (ingredients.length > 0) {
          console.log(
            `Successfully extracted ${ingredients.length} ingredients with selector '${selector}'`,
          );
          return ingredients;
        }
      }
    } catch (error) {
      continue;
    }
  }

  console.log('No ingredients found with any selector');
  return [];
}

/**
 * Extract cooking instructions using comprehensive selectors
 */
function extractInstructions($: cheerio.CheerioAPI): string[] {
  const instructions: string[] = [];

  // Comprehensive list of instruction selectors
  const instructionSelectors = [
    // Schema.org structured data
    '[itemprop="recipeInstructions"]',
    '[itemprop="instructions"]',

    // AllRecipes specific (most specific first)
    '[data-testid="instruction-step"] p',
    '[data-testid="instruction-step"]',
    '.instructions-section-item p',
    '.instructions-section-item',
    
    // Just One Cookbook specific
    '.recipe-instructions li',
    '.instructions li',
    '.recipe-instructions-list li',
    '.instructions-list li',
    '.recipe-instruction',
    '.instruction-item',
    '.recipe-steps li',
    '.recipe-method li',

    // WordPress Recipe Plugin (WP Recipe Maker)
    '.wprm-recipe-instructions-container .wprm-recipe-instruction-text',
    '.wprm-recipe-instruction-text',
    '.wprm-recipe-instructions li',

    // Food Network
    '.recipe-instructions li',
    '.instructions li',
    '.recipe-steps li',

    // BBC Good Food
    '.recipe-method__list li',
    '.method-list li',

    // Serious Eats
    '.recipe-instructions li',
    '.recipe-steps li',

    // Generic instruction patterns
    '[class*="instruction"] p',
    '[class*="step"] p',
    '[class*="method"] p',
    '.instructions li',
    '.instructions-list li',
    '.recipe-instructions li',
    '.recipe-instructions-list li',
    '.recipe-steps li',
    '.recipe-method li',
    '.method li',
    '.steps li',
  ];

  for (const selector of instructionSelectors) {
    try {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `Found ${elements.length} potential instructions with selector '${selector}'`,
        );

        elements.each((_, element) => {
          // Get the element
          const $element = $(element);
          
          // Remove any img tags before extracting text
          $element.find('img').remove();
          
          // Remove any script tags
          $element.find('script').remove();
          
          // Remove any style tags
          $element.find('style').remove();
          
          // Remove any svg tags
          $element.find('svg').remove();
          
          // Get clean text content
          let text = $element.text().trim();
          
          // Skip if it's just a header like "Directions" or "Instructions"
          if (text.toLowerCase() === 'directions' || 
              text.toLowerCase() === 'instructions' ||
              text.toLowerCase() === 'steps') {
            return; // continue to next element
          }
          
          // Filter out very short text (likely headers or UI elements)
          if (text && text.length > 10) {
            // Normalize whitespace (replace multiple spaces/newlines with single space)
            text = text.replace(/\s+/g, ' ').trim();
            
            // Remove any remaining HTML-like content (shouldn't be there, but just in case)
            text = text.replace(/<[^>]*>/g, '');
            
            // Don't add duplicates
            if (!instructions.includes(text)) {
              instructions.push(text);
            }
          }
        });

        if (instructions.length > 0) {
          console.log(
            `Successfully extracted ${instructions.length} instructions with selector '${selector}'`,
          );
          return instructions;
        }
      }
    } catch (error) {
      continue;
    }
  }

  console.log('No instructions found with any selector');
  return [];
}

