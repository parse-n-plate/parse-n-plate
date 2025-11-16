import { NextRequest, NextResponse } from 'next/server';
import { formatError, ERROR_CODES } from '@/utils/formatError';
import { parseRecipe } from '@/utils/scrape_recipe';

/**
 * API endpoint for recipe scraping using Node.js
 * Migrated from Python to work with Vercel serverless functions
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { url } = await req.json();

    // Validate URL is provided and is a string
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_INVALID_URL,
          'URL is required and must be a string',
        ),
      );
    }

    // Basic URL format validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        formatError(ERROR_CODES.ERR_INVALID_URL, 'Invalid URL format'),
      );
    }

    console.log(`Starting recipe scrape for URL: ${url}`);

    // Call the Node.js scraper (no longer spawning Python process)
    const result = await parseRecipe(url);

    // Check if scraper returned an error
    if ('error' in result) {
      console.error('Scraper returned error:', result.error);
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_NO_RECIPE_FOUND,
          'Could not extract recipe from this page',
        ),
      );
    }

    // Validate we have complete recipe data
    const hasTitle =
      result.title && typeof result.title === 'string' && result.title.trim().length > 0;
    const hasIngredients =
      result.ingredients && Array.isArray(result.ingredients) && result.ingredients.length > 0;
    const hasInstructions =
      result.instructions && Array.isArray(result.instructions) && result.instructions.length > 0;

    if (!hasTitle && !hasIngredients && !hasInstructions) {
      console.error('Incomplete recipe data:', result);
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_NO_RECIPE_FOUND,
          'No recipe content found on this page',
        ),
      );
    }

    // Return successful response with recipe data
    console.log(
      `Successfully scraped recipe: "${result.title}" with ${result.ingredients.length} ingredients and ${result.instructions.length} instructions`,
    );

    return NextResponse.json({
      success: true,
      title: result.title,
      ingredients: result.ingredients,
      instructions: result.instructions,
    });
  } catch (error) {
    console.error('Recipe scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for timeout errors
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        formatError(ERROR_CODES.ERR_TIMEOUT, 'Request timed out'),
      );
    }

    // Check for network errors
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        formatError(ERROR_CODES.ERR_FETCH_FAILED, 'Could not connect to recipe site'),
      );
    }

    // Generic error fallback
    return NextResponse.json(
      formatError(ERROR_CODES.ERR_UNKNOWN, 'An unexpected error occurred'),
    );
  }
}
