'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  parseIngredients,
  parseInstructions,
  recipeScrape,
  validateRecipeUrl,
  fetchHtml,
} from '@/utils/recipe-parse';
import { useRouter } from 'next/navigation';
import { useRecipe } from '@/contexts/RecipeContext';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipeErrorHandler } from '@/hooks/useRecipeErrorHandler';
import { errorLogger } from '@/utils/errorLogger';
import { Search, X } from 'lucide-react';
import LoadingAnimation from './loading-animation';
import { ParsedRecipe } from '@/lib/storage';

interface SearchFormProps {
  setErrorAction: (error: boolean) => void;
  setErrorMessage?: (message: string) => void;
  initialUrl?: string;
}

export default function SearchForm({
  setErrorAction,
  setErrorMessage,
  initialUrl = '',
}: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<ParsedRecipe[]>([]);
  const { setParsedRecipe } = useRecipe();
  const { addRecipe, recentRecipes } = useParsedRecipes();
  const { handle: handleError } = useRecipeErrorHandler();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if query looks like a URL
  const isUrl = (text: string) => {
    return (
      text.includes('http') ||
      text.includes('www.') ||
      text.includes('.com') ||
      text.includes('.org')
    );
  };

  // Search through cached recipes
  const searchRecipes = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim() || isUrl(searchQuery)) {
        setSearchResults([]);
        return;
      }

      const filtered = recentRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setSearchResults(filtered.slice(0, 5)); // Show max 5 results
    },
    [recentRecipes],
  );

  // Handle focus state for animation
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay to allow clicking on dropdown items
    setTimeout(() => {
      if (!query.trim() && !loading) {
        setIsFocused(false);
        setShowDropdown(false);
      }
    }, 200);
  };

  // Handle recipe selection from dropdown
  const handleRecipeSelect = (recipe: ParsedRecipe) => {
    setParsedRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
    });
    setQuery('');
    setShowDropdown(false);
    setIsFocused(false);
    router.push('/parsed-recipe-page');
  };

  const handleParse = useCallback(async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setErrorAction(false);
      if (setErrorMessage) setErrorMessage('');

      // Step 1: Validate if URL contains a recipe or not
      const validUrlResponse = await validateRecipeUrl(query);

      if (!validUrlResponse.success) {
        const errorMessage = handleError(validUrlResponse.error.code);
        errorLogger.log(
          validUrlResponse.error.code,
          validUrlResponse.error.message,
          query,
        );
        setErrorAction(true);
        if (setErrorMessage) setErrorMessage(errorMessage);
        return;
      }

      if (!validUrlResponse.isRecipe) {
        const errorMessage = handleError('ERR_NO_RECIPE_FOUND');
        errorLogger.log(
          'ERR_NO_RECIPE_FOUND',
          'No recipe found on this page',
          query,
        );
        setErrorAction(true);
        if (setErrorMessage) setErrorMessage(errorMessage);
        return;
      }

      // Step 2: Scrape with HTML scraper (Node.js)
      const scrapedData = await recipeScrape(query);

      // Debug: Log what the scraper returned
      console.log('HTML scraper response:', scrapedData);

      // Check if scraping failed completely
      if (!scrapedData.success || scrapedData.error) {
        console.log('HTML scraper failed, trying AI parsing from raw HTML...');

        // Fallback to raw HTML parsing if scraper failed
        const htmlRes = await fetchHtml(query);

        if (!htmlRes.success) {
          const errorMessage = handleError(htmlRes.error.code);
          errorLogger.log(htmlRes.error.code, htmlRes.error.message, query);
          setErrorAction(true);
          if (setErrorMessage) setErrorMessage(errorMessage);
          return;
        }

        // Parse both ingredients and instructions with AI from raw HTML
        const aiParsedIngredients = await parseIngredients(htmlRes.html);
        const aiParsedInstructions = await parseInstructions(htmlRes.html);

        if (!aiParsedIngredients.success || !aiParsedInstructions.success) {
          const errorCode = !aiParsedIngredients.success
            ? aiParsedIngredients.error.code
            : aiParsedInstructions.error.code;
          const errorMessage = handleError(errorCode);
          errorLogger.log(errorCode, 'AI parsing failed', query);
          setErrorAction(true);
          if (setErrorMessage) setErrorMessage(errorMessage);
          return;
        }

        // Use AI-parsed data
        scrapedData.title = aiParsedIngredients.data[0];
        scrapedData.ingredients = aiParsedIngredients.data[1];
        scrapedData.instructions = Array.isArray(aiParsedInstructions.data)
          ? aiParsedInstructions.data
          : [aiParsedInstructions.data];
      } else {
        // Step 3: HTML scraper succeeded, now clean up with AI
        console.log(
          'HTML scraper succeeded, sending to AI for cleanup and formatting...',
        );

        // Convert scraped ingredients array to text for AI
        const ingredientsText = Array.isArray(scrapedData.ingredients)
          ? scrapedData.ingredients.join('\n')
          : scrapedData.ingredients;

        // Convert scraped instructions array to text for AI
        const instructionsText = Array.isArray(scrapedData.instructions)
          ? scrapedData.instructions.join('\n')
          : scrapedData.instructions;

        // Step 3.1: AI cleanup and formatting for ingredients
        const aiParsedIngredients = await parseIngredients(ingredientsText);

        if (!aiParsedIngredients.success) {
          console.warn(
            'AI cleanup failed for ingredients, using raw scraped data',
          );
          // Keep the scraped data as-is if AI fails
        } else {
          // Use AI-cleaned and formatted data
          scrapedData.title = aiParsedIngredients.data[0];
          scrapedData.ingredients = aiParsedIngredients.data[1];
        }

        // Step 3.2: AI cleanup and formatting for instructions
        const aiParsedInstructions = await parseInstructions(instructionsText);

        if (!aiParsedInstructions.success) {
          console.warn(
            'AI cleanup failed for instructions, using raw scraped data',
          );
          // Keep the scraped data as-is if AI fails
        } else {
          // Use AI-cleaned instructions
          scrapedData.instructions = Array.isArray(aiParsedInstructions.data)
            ? aiParsedInstructions.data
            : [aiParsedInstructions.data];
        }
      }

      // Step 3: Store in context and redirect
      // Convert flat ingredient array to grouped format (if needed)
      // Check if ingredients are already in grouped format
      const isAlreadyGrouped =
        Array.isArray(scrapedData.ingredients) &&
        scrapedData.ingredients.length > 0 &&
        scrapedData.ingredients.every(
          (item: unknown) =>
            typeof item === 'object' &&
            item !== null &&
            'groupName' in item &&
            'ingredients' in item,
        );

      const formattedIngredients = isAlreadyGrouped
        ? scrapedData.ingredients // Already in grouped format, use as-is
        : Array.isArray(scrapedData.ingredients)
          ? [
              {
                groupName: 'Main',
                ingredients: scrapedData.ingredients,
              },
            ]
          : scrapedData.ingredients; // Fallback if it's already an object

      setParsedRecipe({
        title: scrapedData.title,
        ingredients: formattedIngredients,
        instructions: scrapedData.instructions,
      });

      // Step 4: Add to recent recipes
      const recipeSummary = Array.isArray(scrapedData.instructions)
        ? scrapedData.instructions.join(' ').slice(0, 140)
        : scrapedData.instructions.slice(0, 140);

      addRecipe({
        title: scrapedData.title,
        summary: recipeSummary,
        url: query,
        ingredients: formattedIngredients,
        instructions: scrapedData.instructions,
      });

      // Step 5: Redirect to the parsed recipe page
      router.push('/parsed-recipe-page');
    } catch (err) {
      console.error('Parse error:', err);
      errorLogger.log(
        'ERR_UNKNOWN',
        'An unexpected error occurred during parsing',
        query,
      );
      setErrorAction(true);
      if (setErrorMessage)
        setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    query,
    setErrorAction,
    setErrorMessage,
    setParsedRecipe,
    addRecipe,
    handleError,
    router,
  ]);

  // Handle input changes and search
  useEffect(() => {
    searchRecipes(query);
    setShowDropdown(isFocused && query.trim() !== '' && !isUrl(query));

    if (query.trim()) {
      setIsFocused(true);
    }
  }, [query, isFocused, recentRecipes, searchRecipes]);

  // Handle initialUrl from navbar
  useEffect(() => {
    if (initialUrl) {
      setQuery(initialUrl);
      setIsFocused(true);
      // Auto-trigger parsing after a short delay
      setTimeout(() => {
        if (isUrl(initialUrl)) {
          handleParse();
        }
      }, 500);
    }
  }, [initialUrl, handleParse]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isUrl(query)) {
        handleParse();
      }
    }
  };

  const clearInput = () => {
    setQuery('');
    setIsFocused(false);
    setShowDropdown(false);
    // Focus back to input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <>
      <LoadingAnimation isVisible={loading} />
      <div className="relative w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isUrl(query)) handleParse();
          }}
        >
          <div
            className={`
              bg-stone-100 rounded-[9999px] border border-[#d9d9d9] 
              transition-all duration-300 ease-in-out
              hover:border-[#4F46E5] hover:border-opacity-80
              ${isFocused ? 'shadow-sm border-[#4F46E5] border-opacity-60' : ''}
            `}
          >
            <div className="flex items-center px-4 py-4 relative">
              {/* Search Icon */}
              <Search className="w-4 h-4 text-stone-600 flex-shrink-0" />

              {/* Input */}
              <div className="flex-1 ml-2 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isFocused
                      ? query && !isUrl(query)
                        ? 'Search recipes...'
                        : 'Try entering a recipe URL'
                      : 'Try entering a recipe URL'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={`
                    w-full bg-transparent font-albert text-[14px] text-stone-600 
                    placeholder:text-stone-500 focus:outline-none border-none
                    transition-all duration-300 ease-in-out
                    ${isFocused ? 'text-left' : 'text-center'}
                  `}
                  disabled={loading}
                />
              </div>

              {/* Clear Button */}
              {query && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="ml-2 p-1 hover:bg-stone-200 rounded-full transition-all duration-200 flex-shrink-0"
                  disabled={loading}
                >
                  <X className="w-4 h-4 text-stone-600" />
                </button>
              )}

              {/* Parse Button (for URLs) */}
              {query && isUrl(query) && (
                <button
                  type="submit"
                  className="ml-2 bg-[#FFA423] hover:bg-[#FF9500] text-white font-albert text-[12px] px-3 py-1.5 rounded-full transition-colors duration-200 flex-shrink-0"
                  disabled={loading}
                >
                  Parse Recipe
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#d9d9d9] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-xs font-albert font-medium text-stone-500 px-3 py-2 border-b border-stone-200">
                Recent Recipes ({searchResults.length})
              </div>
              {searchResults.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleRecipeSelect(recipe)}
                  className="w-full text-left p-3 hover:bg-stone-50 transition-colors duration-200 border-b border-stone-100 last:border-b-0"
                >
                  <div className="font-albert font-medium text-[14px] text-stone-800 truncate">
                    {recipe.title}
                  </div>
                  <div className="font-albert text-[12px] text-stone-500 mt-1 line-clamp-2">
                    {recipe.summary}
                  </div>
                  <div className="font-albert text-[10px] text-stone-400 mt-1">
                    {new Date(recipe.parsedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
