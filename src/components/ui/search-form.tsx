'use client';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  parseIngredients,
  parseInstructions,
  recipeScrape,
  validateRecipeUrl,
  fetchHtml,
} from '@/utils/recipe-parse';
import { useRouter } from 'next/navigation';
import { useRecipe } from '@/contexts/RecipeContext';
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<ParsedRecipe[]>([]);
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false); // Show/hide image upload interface
  
  const { setParsedRecipe } = useRecipe();
  const router = useRouter();
      // Store parsed recipe in context
      // Note: No sourceUrl for image-based recipes (they don't have a URL to link back to)
      setParsedRecipe({
        title: response.title,
        ingredients: response.ingredients,
        instructions: response.instructions,
      });

        // Step 3.1: Parse ingredients with AI
        const aiParsedIngredients = await parseIngredients(htmlRes.html);

        // Step 3.2: Parse instructions with AI
        const aiParsedInstructions = await parseInstructions(htmlRes.html);

      // Navigate to parsed recipe page
      router.push('/parsed-recipe-page');
      
      // Close image upload interface after successful parse
      setShowImageUpload(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error('[Client] Image parse error:', err);
      errorLogger.log(
        'ERR_UNKNOWN',
        'An unexpected error occurred during image parsing',
        selectedImage.name,
      );
      setErrorAction(true);
      if (setErrorMessage)
        setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    selectedImage,
    setErrorAction,
    setErrorMessage,
    setParsedRecipe,
    addRecipe,
    handleError,
    router,
  ]);

  const handleParse = useCallback(async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setErrorAction(false);
      if (setErrorMessage) setErrorMessage('');

      // Step 1: Quick validation to ensure URL contains recipe-related keywords
      // This provides fast feedback before making the full parsing request
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

      // Step 2: Parse recipe using unified AI-based parser
      // This handles all the complexity internally:
      // - Fetches and cleans HTML
      // - Tries JSON-LD extraction first (fast, no AI tokens)
      // - Falls back to AI parsing if needed
      // - Returns consistently structured data
      console.log('[Client] Calling unified recipe parser...');
      const response = await recipeScrape(query);

      // Check if parsing failed
      if (!response.success || response.error) {
        const errorCode = response.error?.code || 'ERR_NO_RECIPE_FOUND';
        const errorMessage = handleError(errorCode);
        errorLogger.log(errorCode, response.error?.message || 'Parsing failed', query);
        setErrorAction(true);
        if (setErrorMessage) setErrorMessage(errorMessage);
        return;
      }

      console.log('[Client] Successfully parsed recipe:', response.title);

      // Step 3: Store parsed recipe in context
      // The new parser already returns data in the correct grouped format
      setParsedRecipe({
        title: response.title,
        ingredients: response.ingredients,
        instructions: response.instructions,
        sourceUrl: query, // Store the source URL for linking back
        datePublished: response.datePublished, // Store publication date if available
      });

      // Step 4: Add to recent recipes for quick access
      const recipeSummary = Array.isArray(response.instructions)
        ? response.instructions.join(' ').slice(0, 140)
        : response.instructions.slice(0, 140);

      addRecipe({
        title: response.title,
        summary: recipeSummary,
        url: query,
        ingredients: response.ingredients,
        instructions: response.instructions,
      });

      // Step 5: Navigate to the parsed recipe page
      router.push('/parsed-recipe-page');
    } catch (err) {
      console.error('[Client] Parse error:', err);
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

        // Stitch final scrapedData format
        scrapedData = {
          title: aiParsedIngredients[0],
          ingredients: aiParsedIngredients[1],
          instructions: Array.isArray(aiParsedInstructions)
            ? aiParsedInstructions
            : [aiParsedInstructions],
        };
      }

      // Step 3: Store in context and redirect
      setParsedRecipe({
        title: scrapedData.title,
        ingredients: scrapedData.ingredients,
        instructions: scrapedData.instructions,
      });

      // Step 4: Redirect to the parsed recipe page
      router.push('/parsed-recipe-page');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RecipeParsingLoader isVisible={loading} />
      <div className="relative w-full">
        {/* URL Input Form */}
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

              {/* Image Upload Button */}
              <Button
                type="button"
                onClick={toggleImageUpload}
                variant="ghost"
                size="icon"
                className="ml-2 flex-shrink-0"
                disabled={loading}
                title="Upload recipe image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>

              {/* Clear Button */}
              {query && (
                <Button
                  type="button"
                  onClick={clearInput}
                  variant="ghost"
                  size="icon"
                  className="ml-2 flex-shrink-0"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {/* Parse Button (for URLs) */}
              {query && isUrl(query) && (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  disabled={loading}
                >
                  Parse Recipe
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Image Upload Interface - Shows when button is clicked */}
        {showImageUpload && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-base font-medium text-[#1e1e1e]">
                  Upload Recipe Image
                </CardDescription>
                <Button
                  type="button"
                  onClick={toggleImageUpload}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Image Upload Button or Preview */}
              {!imagePreview ? (
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-auto py-12 border-2 border-dashed flex flex-col items-center justify-center gap-3 hover:border-[#4F46E5] transition-all duration-300"
                >
                  <Upload className="w-12 h-12 text-stone-400" />
                  <div className="text-center">
                    <p className="font-albert text-stone-600 font-medium">
                      Click to upload recipe image
                    </p>
                    <CardDescription className="mt-1">
                      PNG, JPG, or WEBP (max 10MB)
                    </CardDescription>
                  </div>
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <Card className="relative overflow-hidden p-0">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-auto max-h-96 object-contain bg-stone-50"
                    />
                    {/* Remove Image Button */}
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      variant="secondary"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg"
                      disabled={loading}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </Card>

                  {/* Parse Button */}
                  <Button
                    type="button"
                    onClick={handleImageParse}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    Parse Recipe from Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
