'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Paperclip, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
// Removed ParsedRecipe import - no longer needed without dropdown
import {
  recipeScrape,
  validateRecipeUrl,
  parseRecipeFromImage,
} from '@/utils/recipe-parse';
import { errorLogger } from '@/utils/errorLogger';
import { isUrl } from '@/utils/searchUtils';
import { addToSearchHistory } from '@/lib/searchHistory';
import { useRecipeErrorHandler } from '@/hooks/useRecipeErrorHandler';
import { ERROR_MESSAGES, ERROR_CODES } from '@/utils/formatError';
import LoadingAnimation from '@/components/ui/loading-animation';
// Import Solar icons for URL and Image modes
import LinkRound from '@solar-icons/react/csr/text-formatting/LinkRound';
import Gallery from '@solar-icons/react/csr/video/Gallery';

/**
 * HomepageSearch Component
 * 
 * Large search bar for the homepage with a paperclip attachment button at the front.
 * Works like the navbar search bar but styled for homepage prominence.
 * Based on Figma design with paperclip icon and dropdown arrow.
 */
export default function HomepageSearch() {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  // Removed recentRecipes, filteredRecipes, showRecents, and selectedIndex states
  // since we're removing the dropdown - HomepageRecentRecipes component handles this
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  // Mode switching state: 'url' or 'image'
  const [inputMode, setInputMode] = useState<'url' | 'image'>('url');
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed dropdownRef - no longer needed without dropdown
  const fileInputRef = useRef<HTMLInputElement>(null);
  const switcherButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const { setParsedRecipe } = useRecipe();
  const { addRecipe } = useParsedRecipes();
  const { handle: handleError } = useRecipeErrorHandler();
  const router = useRouter();

  // Removed recent recipes loading and filtering logic
  // HomepageRecentRecipes component handles displaying recent recipes

  // Handle clicks outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking on the switcher button or dropdown menu
      if (
        switcherButtonRef.current?.contains(target) ||
        dropdownMenuRef.current?.contains(target)
      ) {
        return;
      }
      
      // Close if clicking outside the container
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsExpanded(false);
        setShowAttachmentMenu(false);
        // Only clear query if in URL mode
        if (inputMode === 'url') {
          setQuery('');
        }
      }
    };

    if (isExpanded || showAttachmentMenu) {
      // Use click event (not mousedown) so button onClick fires first
      document.addEventListener('click', handleClickOutside);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isExpanded, showAttachmentMenu, inputMode]);

  // Handle focus - expand search bar (visual feedback only, no dropdown)
  const handleFocus = () => {
    setIsExpanded(true);
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow images
    if (!file.type.startsWith('image/')) {
      const errorMessage = ERROR_MESSAGES[ERROR_CODES.ERR_INVALID_FILE_TYPE];
      errorLogger.log(ERROR_CODES.ERR_INVALID_FILE_TYPE, errorMessage, file.name);
      console.error('Invalid file type:', file.type);
      // Show error to user (error handler will display it)
      handleError(ERROR_CODES.ERR_INVALID_FILE_TYPE);
      return;
    }

    // Validate file size - max 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      const errorMessage = ERROR_MESSAGES[ERROR_CODES.ERR_FILE_TOO_LARGE];
      errorLogger.log(ERROR_CODES.ERR_FILE_TOO_LARGE, errorMessage, file.name);
      console.error('File too large:', file.size);
      // Show error to user (error handler will display it)
      handleError(ERROR_CODES.ERR_FILE_TOO_LARGE);
      return;
    }

    // Set the selected file
    setSelectedImage(file);

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image parsing
  const handleImageParse = useCallback(async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);

      console.log('[HomepageSearch] Parsing recipe from image:', selectedImage.name);

      // Call the image parsing function
      const response = await parseRecipeFromImage(selectedImage);

      // Check if parsing failed
      if (!response.success || response.error) {
        const errorCode = response.error?.code || 'ERR_NO_RECIPE_FOUND';
        const errorMessage = handleError(errorCode);
        errorLogger.log(errorCode, response.error?.message || 'Image parsing failed', selectedImage.name);
        console.error('Image parse error:', errorMessage);
        return;
      }

      console.log('[HomepageSearch] Successfully parsed recipe from image:', response.title);

      // Store parsed recipe
      const recipeToStore = {
        title: response.title,
        ingredients: response.ingredients,
        instructions: response.instructions,
        author: response.author,
        sourceUrl: response.sourceUrl || `image:${selectedImage.name}`,
        summary: response.summary,
        cuisine: response.cuisine,
      };

      setParsedRecipe(recipeToStore);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Add to recent recipes
      const recipeSummary = Array.isArray(response.instructions)
        ? response.instructions
            .map((inst: any) => (typeof inst === 'string' ? inst : inst.detail))
            .join(' ')
            .slice(0, 140)
        : response.instructions.slice(0, 140);

      addRecipe({
        title: response.title,
        summary: recipeSummary,
        description: response.summary,
        url: `image:${selectedImage.name}`,
        ingredients: response.ingredients,
        instructions: response.instructions,
        author: response.author,
        sourceUrl: response.sourceUrl || `image:${selectedImage.name}`,
        cuisine: response.cuisine,
      });

      // Navigate to recipe page
      router.push('/parsed-recipe-page');
      setSelectedImage(null);
      setImagePreview(null);
      setIsExpanded(false);
    } catch (err) {
      console.error('[HomepageSearch] Image parse error:', err);
      errorLogger.log('ERR_UNKNOWN', 'An unexpected error occurred during image parsing', selectedImage.name);
    } finally {
      setLoading(false);
    }
  }, [selectedImage, setParsedRecipe, addRecipe, handleError, router]);

  // Handle URL parsing
  const handleParse = useCallback(
    async (url: string) => {
      if (!url.trim()) return;

      try {
        setLoading(true);

        // Validate URL
        const validUrlResponse = await validateRecipeUrl(url);

        if (!validUrlResponse.success) {
          const errorMessage = handleError(validUrlResponse.error.code);
          errorLogger.log(
            validUrlResponse.error.code,
            validUrlResponse.error.message,
            url,
          );
          console.error('Parse error:', errorMessage);
          return;
        }

        if (!validUrlResponse.isRecipe) {
          const errorMessage = handleError('ERR_NO_RECIPE_FOUND');
          errorLogger.log('ERR_NO_RECIPE_FOUND', 'No recipe found on this page', url);
          console.error('Parse error:', errorMessage);
          return;
        }

        // Parse recipe
        const response = await recipeScrape(url);

        if (!response.success || response.error) {
          const errorCode = response.error?.code || 'ERR_NO_RECIPE_FOUND';
          const errorMessage = handleError(errorCode);
          errorLogger.log(errorCode, response.error?.message || 'Parsing failed', url);
          console.error('Parse error:', errorMessage);
          return;
        }

        // Store parsed recipe
        const recipeToStore = {
          title: response.title,
          ingredients: response.ingredients,
          instructions: response.instructions,
          author: response.author,
          sourceUrl: response.sourceUrl || url,
          summary: response.summary,
          cuisine: response.cuisine,
        };

        setParsedRecipe(recipeToStore);

        await new Promise((resolve) => setTimeout(resolve, 0));

        // Add to recent recipes
        const recipeSummary = Array.isArray(response.instructions)
          ? response.instructions
              .map((inst: any) => (typeof inst === 'string' ? inst : inst.detail))
              .join(' ')
              .slice(0, 140)
          : response.instructions.slice(0, 140);

        addRecipe({
          title: response.title,
          summary: recipeSummary,
          description: response.summary,
          url: url,
          ingredients: response.ingredients,
          instructions: response.instructions,
          author: response.author,
          sourceUrl: response.sourceUrl || url,
          cuisine: response.cuisine,
        });

        // Add to search history
        addToSearchHistory(url, response.title);

        // Navigate to recipe page
        router.push('/parsed-recipe-page');
        setQuery('');
        setIsExpanded(false);
      } catch (err) {
        console.error('[HomepageSearch] Parse error:', err);
        errorLogger.log('ERR_UNKNOWN', 'An unexpected error occurred', url);
      } finally {
        setLoading(false);
      }
    },
    [setParsedRecipe, addRecipe, handleError, router],
  );

  // Removed handleRecipeSelect - recipe selection is handled by HomepageRecentRecipes component

  // Handle mode switching
  const handleModeSwitch = (mode: 'url' | 'image') => {
    setInputMode(mode);
    setShowAttachmentMenu(false);
    // Clear states when switching modes
    if (mode === 'url') {
      setSelectedImage(null);
      setImagePreview(null);
    } else {
      setQuery('');
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'url' && isUrl(query)) {
      handleParse(query);
    } else if (inputMode === 'image' && selectedImage) {
      handleImageParse();
    }
  };

  // Clear input
  const clearInput = () => {
    if (inputMode === 'url') {
      setQuery('');
      inputRef.current?.focus();
    } else {
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle keyboard navigation (simplified - no dropdown navigation)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle ESC to close
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setQuery('');
      return;
    }

    // Handle Enter to submit
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputMode === 'url' && isUrl(query)) {
        handleParse(query);
      } else if (inputMode === 'image' && selectedImage) {
        handleImageParse();
      }
    }
  };

  return (
    <>
      <LoadingAnimation isVisible={loading} />
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit}>
          <div
            className={`
              bg-white rounded-xl border transition-all duration-200 overflow-hidden
              ${isExpanded 
                ? 'border-[#4F46E5] shadow-lg' 
                : 'border-stone-200 hover:border-stone-300 shadow-sm'
              }
            `}
          >
            <div className="flex items-stretch">
              {/* Mode Switcher Button with Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  ref={switcherButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAttachmentMenu(!showAttachmentMenu);
                  }}
                  className="flex items-center gap-2.5 px-4 py-4 min-h-[56px] bg-stone-100 hover:bg-stone-200 rounded-l-xl border-r border-stone-200 transition-colors"
                  aria-label="Input mode options"
                  aria-expanded={showAttachmentMenu}
                >
                  {/* Show current mode icon */}
                  {inputMode === 'url' ? (
                    <LinkRound className="w-5 h-5 text-stone-700 flex-shrink-0" />
                  ) : (
                    <Gallery className="w-5 h-5 text-stone-700 flex-shrink-0" />
                  )}
                  <div className="h-5 w-px bg-stone-300"></div>
                  <ChevronDown className={`w-5 h-5 text-stone-700 flex-shrink-0 transition-transform ${showAttachmentMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Mode Switcher Dropdown Menu - styled to match Figma */}
                {showAttachmentMenu && (
                  <div 
                    ref={dropdownMenuRef}
                    className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 min-w-[200px]"
                  >
                    <div className="p-2">
                      {/* URL Option */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-base font-albert text-stone-800 hover:bg-stone-50 rounded-md transition-colors"
                        onClick={() => handleModeSwitch('url')}
                      >
                        <LinkRound className="w-5 h-5 text-stone-700 flex-shrink-0" />
                        <span>URL</span>
                      </button>
                      
                      {/* Separator */}
                      <div className="h-px bg-stone-200 my-1"></div>
                      
                      {/* Image Option */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-base font-albert text-stone-800 hover:bg-stone-50 rounded-md transition-colors"
                        onClick={() => handleModeSwitch('image')}
                      >
                        <Gallery className="w-5 h-5 text-stone-700 flex-shrink-0" />
                        <span>Image</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex items-center flex-1 px-5 py-4 min-h-[56px]">
                {/* URL Mode Input */}
                {inputMode === 'url' && (
                  <>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="What recipe do you want to simplify?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={handleFocus}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent font-albert text-base text-stone-800 placeholder:text-stone-500 focus:outline-none w-full"
                    />

                    {/* Clear Button */}
                    {query && (
                      <button
                        type="button"
                        onClick={clearInput}
                        className="ml-4 p-1.5 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0"
                        aria-label="Clear search"
                      >
                        <X className="w-5 h-5 text-stone-600" />
                      </button>
                    )}

                    {/* ESC hint */}
                    {isExpanded && !query && (
                      <div className="ml-4 flex-shrink-0">
                        <kbd className="px-2.5 py-1 text-xs font-albert text-stone-500 bg-stone-50 border border-stone-300 rounded-md">
                          ESC
                        </kbd>
                      </div>
                    )}
                  </>
                )}

                {/* Image Mode Input */}
                {inputMode === 'image' && (
                  <>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {/* Clickable area to trigger file input */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex-1 text-left font-albert text-base text-stone-800 placeholder:text-stone-500 focus:outline-none w-full"
                    >
                      {selectedImage ? (
                        <span className="text-stone-800">{selectedImage.name}</span>
                      ) : (
                        <span className="text-stone-500">Insert your grandma's recipe</span>
                      )}
                    </button>

                    {/* Clear Button */}
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={clearInput}
                        className="ml-4 p-1.5 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0"
                        aria-label="Clear image"
                      >
                        <X className="w-5 h-5 text-stone-600" />
                      </button>
                    )}

                    {/* Parse Button (for images) */}
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={handleImageParse}
                        className="ml-4 bg-[#FFA423] hover:bg-[#FF9500] text-white font-albert text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                        disabled={loading}
                      >
                        Parse Recipe
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
        {/* Removed dropdown - HomepageRecentRecipes component handles displaying recent recipes */}
      </div>
    </>
  );
}

