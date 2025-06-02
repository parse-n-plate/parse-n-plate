
import { useState } from 'react';

interface Recipe {
  title: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  ingredients: string[];
  instructions: string[];
  source?: string;
}

export const useRecipeParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseRecipe = async (url: string): Promise<Recipe | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching recipe from URL:', url);
      
      // Use a CORS proxy to fetch the webpage content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe page');
      }

      const data = await response.json();
      const htmlContent = data.contents;

      // Parse the HTML content to extract recipe data
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Try to find JSON-LD structured data first (most reliable)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let recipeData = null;

      for (const script of jsonLdScripts) {
        try {
          const jsonData = JSON.parse(script.textContent || '');
          const recipes = Array.isArray(jsonData) ? jsonData : [jsonData];
          
          for (const item of recipes) {
            if (item['@type'] === 'Recipe' || (item['@graph'] && item['@graph'].some((g: any) => g['@type'] === 'Recipe'))) {
              recipeData = item['@type'] === 'Recipe' ? item : item['@graph'].find((g: any) => g['@type'] === 'Recipe');
              break;
            }
          }
          
          if (recipeData) break;
        } catch (e) {
          continue;
        }
      }

      if (recipeData) {
        console.log('Found structured recipe data:', recipeData);
        return parseStructuredData(recipeData, url);
      }

      // Fallback to HTML parsing if no structured data found
      console.log('No structured data found, parsing HTML');
      return parseHtmlContent(doc, url);

    } catch (err) {
      console.error('Recipe parsing error:', err);
      setError('Failed to parse recipe. Please check the URL and try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseRecipe,
    isLoading,
    error
  };
};

function parseStructuredData(data: any, url: string): Recipe {
  const getTextContent = (item: any): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.text) return item.text;
    if (item && typeof item === 'object' && item['@value']) return item['@value'];
    return '';
  };

  const getDuration = (duration: any): string => {
    if (!duration) return '';
    if (typeof duration === 'string') {
      // Parse ISO 8601 duration (PT15M = 15 minutes)
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (match) {
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        if (hours && minutes) return `${hours}h ${minutes}m`;
        if (hours) return `${hours}h`;
        if (minutes) return `${minutes}m`;
      }
    }
    return getTextContent(duration);
  };

  const ingredients = data.recipeIngredient || [];
  const instructions = (data.recipeInstructions || []).map((instruction: any) => {
    if (typeof instruction === 'string') return instruction;
    return getTextContent(instruction.text || instruction.name || instruction);
  });

  return {
    title: getTextContent(data.name) || 'Untitled Recipe',
    image: data.image?.[0]?.url || data.image?.url || data.image,
    prepTime: getDuration(data.prepTime),
    cookTime: getDuration(data.cookTime),
    totalTime: getDuration(data.totalTime),
    servings: data.recipeYield ? String(data.recipeYield) : undefined,
    ingredients: ingredients.map((ing: any) => getTextContent(ing)),
    instructions: instructions.filter((inst: string) => inst.trim().length > 0),
    source: url
  };
}

function parseHtmlContent(doc: Document, url: string): Recipe {
  // Try common selectors for recipe elements
  const title = doc.querySelector('h1')?.textContent?.trim() || 
                doc.querySelector('[class*="recipe"][class*="title"]')?.textContent?.trim() || 
                doc.querySelector('title')?.textContent?.trim() || 
                'Untitled Recipe';

  // Look for ingredients
  const ingredientSelectors = [
    '[class*="ingredient"]',
    '[class*="recipe-ingredient"]',
    'li[itemprop="recipeIngredient"]',
    '.ingredients li',
    '[data-ingredient]'
  ];
  
  let ingredients: string[] = [];
  for (const selector of ingredientSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      ingredients = Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text.length > 0);
      break;
    }
  }

  // Look for instructions
  const instructionSelectors = [
    '[class*="instruction"]',
    '[class*="recipe-instruction"]',
    '[itemprop="recipeInstructions"]',
    '.instructions li',
    '.directions li',
    '[class*="method"] li',
    '[class*="step"]'
  ];
  
  let instructions: string[] = [];
  for (const selector of instructionSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      instructions = Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text.length > 0);
      break;
    }
  }

  // Look for image
  const image = doc.querySelector('[class*="recipe"][class*="image"] img')?.getAttribute('src') ||
                doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

  return {
    title,
    image: image || undefined,
    ingredients: ingredients.length > 0 ? ingredients : ['No ingredients found'],
    instructions: instructions.length > 0 ? instructions : ['No instructions found'],
    source: url
  };
}
