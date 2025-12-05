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

            // Helper function to check if text looks like an author name
            const isAuthorName = (text: string): boolean => {
              if (!text || text.length === 0) return true;
              
              const wordCount = text.split(/\s+/).length;
              const hasCookingTerms = /(heat|add|stir|mix|cook|bake|simmer|boil|fry|roast|season|taste|serve|preheat|chop|dice|slice|mince|pour|drain|whisk|beat|fold|knead|roll|cut|peel|grate|zest|squeeze|melt|saute|brown|caramelize|deglaze|reduce|thicken|thaw|marinate|brine|rub|glaze|garnish|top|sprinkle|drizzle|toss|coat|dredge|flour|bread|batter|crust|filling|topping|sauce|gravy|broth|stock|marinade|dressing|vinaigrette|seasoning|spice|herb|aromatic|flavor|taste|texture|tender|crispy|golden|browned|caramelized|caramel|syrup|honey|sugar|salt|pepper|garlic|onion|herbs|spices)/i.test(text);
              
              // If it's 1-3 words and has no cooking terms, it's likely an author name
              if (wordCount <= 3 && !hasCookingTerms) {
                const looksLikeName = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\.?$/.test(text);
                if (looksLikeName) return true;
              }
              
              // Check for "By [Name]" pattern
              if (/^by\s+[A-Z]/i.test(text)) return true;
              
              return false;
            };

            // Handle different instruction formats
            if (Array.isArray(recipe.recipeInstructions)) {
              instructions = recipe.recipeInstructions
                .map((inst: any) => {
                  // Handle string format
                  if (typeof inst === 'string') return inst.trim();
                  
                  // Handle object with text property
                  if (inst.text && typeof inst.text === 'string')
                    return inst.text.trim();
                  
                  // Handle HowToStep format
                  if (
                    inst['@type'] === 'HowToStep' &&
                    inst.text &&
                    typeof inst.text === 'string'
                  )
                    return inst.text.trim();
                  
                  // Handle HowToStep with name property (Food Network sometimes uses this)
                  if (
                    inst['@type'] === 'HowToStep' &&
                    inst.name &&
                    typeof inst.name === 'string'
                  )
                    return inst.name.trim();
                  
                  // Handle itemListElement format (some sites use this)
                  if (inst.itemListElement && Array.isArray(inst.itemListElement)) {
                    return inst.itemListElement
                      .map((item: any) => {
                        if (item.text) return item.text.trim();
                        if (item.name) return item.name.trim();
                        return '';
                      })
                      .filter((t: string) => t.length > 0)
                      .join(' ');
                  }
                  
                  return '';
                })
                .filter((text: string) => text.length > 10 && !isAuthorName(text));
            } else if (
              typeof recipe.recipeInstructions === 'string' &&
              recipe.recipeInstructions.trim()
            ) {
              // Split string instructions by newlines or periods
              instructions = recipe.recipeInstructions
                .split(/\n+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 10 && !isAuthorName(s));
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

    // Food Network specific (prioritize)
    'h1.o-AssetTitle__a-Headline',
    '.o-AssetTitle__a-Headline',
    'h1[class*="AssetTitle"]',
    '.recipe-title',
    '.recipe-header h1',
    'h1.recipe-title',

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

    // Food Network specific (prioritize)
    '.o-Ingredients__a-ListItem',
    '.o-Ingredients__a-ListItemText',
    '[class*="Ingredients"] [class*="ListItem"]',
    '.ingredients-list li',
    '.recipe-ingredients li',
    '.ingredients li',
    '[data-testid*="ingredient"]',
    '[class*="ingredient-item"]',

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
          
          // For Food Network, check if there's a nested text element
          // Food Network uses .o-Ingredients__a-ListItemText for the actual ingredient text
          let text = '';
          const textElement = $element.find('.o-Ingredients__a-ListItemText').first();
          if (textElement.length > 0) {
            text = textElement.text().trim();
          } else {
            text = $element.text().trim();
          }
          
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

  // Fallback: Look for headings that say "Ingredients" and extract following content
  // This handles sites like shychef.com that use semantic headings instead of class names
  try {
    // Find all h1-h6 headings
    const headings = $('h1, h2, h3, h4, h5, h6');
    headings.each((_, heading) => {
      const $heading = $(heading);
      const headingText = $heading.text().trim().toLowerCase();
      
      // Check if this heading says "Ingredients"
      if (headingText === 'ingredients' || headingText.includes('ingredients')) {
        // Strategy 1: Find the next sibling element
        let $container = $heading.next();
        
        // Strategy 2: If no next sibling, try parent's next sibling
        if ($container.length === 0) {
          $container = $heading.parent().next();
        }
        
        // Strategy 3: Look within the same parent container (for grid layouts)
        if ($container.length === 0) {
          const $parent = $heading.parent();
          $container = $parent.find('p, li, span').not($heading);
        }
        
        // Strategy 4: Look in closest div/section container
        if ($container.length === 0) {
          $container = $heading.closest('div, section').find('p, li, span');
        } else {
          // Get all p, li, and span elements within the container
          $container = $container.find('p, li, span').add($container.filter('p, li, span'));
        }
        
        // Extract text from each element
        $container.each((_, element) => {
          const $element = $(element);
          const text = $element.text().trim();
          
          // Skip empty text, headings, and section labels
          if (text && 
              text.length > 2 && 
              text.toLowerCase() !== 'ingredients' &&
              text.toLowerCase() !== 'main' &&
              text.toLowerCase() !== 'garnish' &&
              !/^[A-Z\s]+:$/.test(text) &&
              !text.match(/^\d+\.?\s*$/)) { // Skip just numbers
            
            // Normalize whitespace
            const normalizedText = text.replace(/\s+/g, ' ').trim();
            
            // Don't add duplicates
            if (!ingredients.includes(normalizedText)) {
              ingredients.push(normalizedText);
            }
          }
        });
      }
    });
    
    if (ingredients.length > 0) {
      console.log(
        `Successfully extracted ${ingredients.length} ingredients using heading-based fallback`,
      );
      return ingredients;
    }
  } catch (error) {
    console.log('Heading-based ingredient extraction failed:', error);
  }

  console.log('No ingredients found with any selector');
  return [];
}

/**
 * Check if an HTML element is likely an author/attribution element
 * This filters at the HTML parsing layer before text extraction
 */
function isAuthorOrAttributionElement(
  $element: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
): boolean {
  // Check element's classes and IDs for author/attribution patterns
  const classAttr = $element.attr('class') || '';
  const idAttr = $element.attr('id') || '';
  const combinedAttr = `${classAttr} ${idAttr}`.toLowerCase();

  // Common author/attribution class/ID patterns
  const authorPatterns = [
    'author',
    'byline',
    'attribution',
    'credit',
    'writer',
    'contributor',
    'posted-by',
    'recipe-author',
    'author-name',
    'author-info',
    'by-author',
    'meta-author',
    'entry-author',
    'post-author',
    // Food Network specific patterns
    'o-attribution',
    'attribution-author',
    'recipe-attribution',
    'recipe-byline',
    'recipe-credit',
    'recipe-contributor',
    // Common variations
    'fn-author',
    'fn-byline',
    'fn-attribution',
  ];

  // Check if element has author-related classes/IDs
  if (authorPatterns.some((pattern) => combinedAttr.includes(pattern))) {
    return true;
  }

  // Check parent elements for author containers
  const parent = $element.parent();
  if (parent.length > 0) {
    const parentClass = parent.attr('class') || '';
    const parentId = parent.attr('id') || '';
    const parentAttr = `${parentClass} ${parentId}`.toLowerCase();

    if (authorPatterns.some((pattern) => parentAttr.includes(pattern))) {
      return true;
    }
  }

  // Check for common author HTML patterns
  // Elements inside <address>, <footer>, or elements with role="contentinfo"
  if (
    $element.closest('address').length > 0 ||
    $element.closest('footer').length > 0 ||
    $element.closest('[role="contentinfo"]').length > 0 ||
    $element.closest('[itemprop="author"]').length > 0
  ) {
    return true;
  }

  return false;
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

    // Food Network specific (prioritize)
    '.o-Method__m-Step',
    '.o-Method__m-StepText',
    '[class*="Method"] [class*="Step"]',
    '.directions-list li',
    '.recipe-instructions li',
    '.instructions li',
    '.recipe-steps li',
    '[data-testid*="instruction"]',
    '[data-testid*="step"]',
    '[class*="instruction-step"]',
    '[class*="direction"]',

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
          
          // Filter out author/attribution elements at HTML parsing layer
          if (isAuthorOrAttributionElement($element, $)) {
            return; // Skip this element - it's author/attribution, not an instruction
          }
          
          // Remove any img tags before extracting text
          $element.find('img').remove();
          
          // Remove any script tags
          $element.find('script').remove();
          
          // Remove any style tags
          $element.find('style').remove();
          
          // Remove any svg tags
          $element.find('svg').remove();
          
          // For Food Network, check if there's a nested text element
          // Food Network uses .o-Method__m-StepText for the actual instruction text
          let text = '';
          const textElement = $element.find('.o-Method__m-StepText').first();
          if (textElement.length > 0) {
            text = textElement.text().trim();
          } else {
            // Also check for p tags inside the step element
            const pElement = $element.find('p').first();
            if (pElement.length > 0) {
              text = pElement.text().trim();
            } else {
              text = $element.text().trim();
            }
          }
          
          // Remove step numbers if present (e.g., "1.", "2.", etc.)
          text = text.replace(/^\d+\.\s*/, '').trim();
          
          // Skip if it's just a header like "Directions" or "Instructions"
          if (text.toLowerCase() === 'directions' || 
              text.toLowerCase() === 'instructions' ||
              text.toLowerCase() === 'steps') {
            return; // continue to next element
          }
          
          // Additional text-based filter as fallback (for edge cases not caught by HTML structure)
          // Skip if it starts with "By " (common attribution pattern)
          if (/^by\s+[A-Z]/i.test(text)) {
            return; // Skip this instruction
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

  // Fallback: Look for headings that say "Recipe", "Directions", or "Instructions" 
  // and extract following list items or paragraphs
  // This handles sites like shychef.com that use semantic headings instead of class names
  try {
    // Find all h1-h6 headings
    const headings = $('h1, h2, h3, h4, h5, h6');
    headings.each((_, heading) => {
      const $heading = $(heading);
      const headingText = $heading.text().trim().toLowerCase();
      
      // Check if this heading says "Recipe", "Directions", or "Instructions"
      if (headingText === 'recipe' || 
          headingText === 'directions' || 
          headingText === 'instructions' ||
          headingText.includes('recipe') ||
          headingText.includes('directions') ||
          headingText.includes('instructions')) {
        
        // Strategy 1: Find the next sibling element
        let $container = $heading.next();
        
        // Strategy 2: If no next sibling, try parent's next sibling
        if ($container.length === 0) {
          $container = $heading.parent().next();
        }
        
        // Strategy 3: Look within the same parent container (for grid layouts)
        let $listItems = $container.find('ol li, ul li');
        
        if ($listItems.length === 0) {
          const $parent = $heading.parent();
          $listItems = $parent.find('ol li, ul li');
        }
        
        // Strategy 4: Look in closest div/section container
        if ($listItems.length === 0) {
          $listItems = $heading.closest('div, section').find('ol li, ul li');
        }
        
        // Extract text from each list item
        $listItems.each((_, element) => {
          const $element = $(element);
          
          // Filter out author/attribution elements
          if (isAuthorOrAttributionElement($element, $)) {
            return; // Skip this element
          }
          
          // Remove any img, script, style tags before extracting text
          $element.find('img').remove();
          $element.find('script').remove();
          $element.find('style').remove();
          $element.find('svg').remove();
          
          const text = $element.text().trim();
          
          // Skip empty text, headings, and section labels
          if (text && 
              text.length > 10 && 
              text.toLowerCase() !== 'directions' &&
              text.toLowerCase() !== 'instructions' &&
              text.toLowerCase() !== 'recipe' &&
              !/^by\s+[A-Z]/i.test(text)) { // Skip "By [Name]" patterns
            
            // Remove step numbers if present (e.g., "1.", "2.", etc.)
            const cleanedText = text.replace(/^\d+\.\s*/, '').trim();
            
            // Normalize whitespace
            const normalizedText = cleanedText.replace(/\s+/g, ' ').trim();
            
            // Don't add duplicates
            if (!instructions.includes(normalizedText)) {
              instructions.push(normalizedText);
            }
          }
        });
      }
    });
    
    if (instructions.length > 0) {
      console.log(
        `Successfully extracted ${instructions.length} instructions using heading-based fallback`,
      );
      return instructions;
    }
  } catch (error) {
    console.log('Heading-based instruction extraction failed:', error);
  }

  console.log('No instructions found with any selector');
  return [];
}

