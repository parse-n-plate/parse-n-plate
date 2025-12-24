'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRecipe } from '@/contexts/RecipeContext';
import { fuzzyMatch, parseSearchQuery, scrollToElement } from '@/utils/searchUtils';
import { Search, X, Carrot, FileText, Wrench, Info, ArrowRight } from 'lucide-react';
import { InstructionStep } from '@/contexts/RecipeContext';

interface CommandKRecipeSearchProps {
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'ingredient' | 'step' | 'tool' | 'metadata';
  title: string;
  subtitle?: string;
  content: string;
  elementId?: string; // For scrolling/jumping
  groupName?: string; // For ingredients
  stepNumber?: number; // For steps
}

/**
 * CommandKRecipeSearch Component
 * 
 * Deep search within the current recipe for:
 * - Ingredients (by name, group)
 * - Instructions/steps (by title, detail)
 * - Equipment/tools (mentioned in steps)
 * - Metadata (title, author, source, etc.)
 */
export default function CommandKRecipeSearch({
  onClose,
}: CommandKRecipeSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { parsedRecipe } = useRecipe();

  // Parse search query for special syntax
  const parsedQuery = useMemo(() => parseSearchQuery(query), [query]);

  // Generate search results
  const results = useMemo(() => {
    if (!parsedRecipe || !parsedQuery.term) return [];

    const searchTerm = parsedQuery.term.toLowerCase();
    const results: SearchResult[] = [];

    // Search ingredients
    if (parsedQuery.type === 'ingredient' || parsedQuery.type === 'all') {
      parsedRecipe.ingredients?.forEach((group, groupIndex) => {
        group.ingredients.forEach((ingredient, ingIndex) => {
          const ingredientName = ingredient.ingredient.toLowerCase();
          if (fuzzyMatch(searchTerm, ingredientName)) {
            results.push({
              id: `ingredient-${groupIndex}-${ingIndex}`,
              type: 'ingredient',
              title: ingredient.ingredient,
              subtitle: `${ingredient.amount} ${ingredient.units}`.trim(),
              content: `${group.groupName}: ${ingredient.ingredient}`,
              elementId: `ingredient-group-${groupIndex}-item-${ingIndex}`,
              groupName: group.groupName,
            });
          }
        });
      });
    }

    // Search instructions/steps
    if (parsedQuery.type === 'step' || parsedQuery.type === 'all') {
      const instructions = parsedRecipe.instructions || [];
      instructions.forEach((instruction, index) => {
        let title = '';
        let detail = '';

        if (typeof instruction === 'string') {
          detail = instruction;
          title = `Step ${index + 1}`;
        } else {
          title = instruction.title || `Step ${index + 1}`;
          detail = instruction.detail || '';
        }

        const searchText = `${title} ${detail}`.toLowerCase();
        if (fuzzyMatch(searchTerm, searchText)) {
          results.push({
            id: `step-${index}`,
            type: 'step',
            title: title,
            subtitle: detail.slice(0, 80) + (detail.length > 80 ? '...' : ''),
            content: detail,
            elementId: `step-${index}`,
            stepNumber: index + 1,
          });
        }
      });
    }

    // Search equipment/tools (mentioned in step details)
    if (parsedQuery.type === 'tool' || parsedQuery.type === 'all') {
      const commonTools = [
        'whisk',
        'spatula',
        'knife',
        'cutting board',
        'pan',
        'pot',
        'skillet',
        'oven',
        'mixer',
        'blender',
        'food processor',
        'grater',
        'peeler',
        'strainer',
        'colander',
        'tongs',
        'ladle',
        'spoon',
        'fork',
        'bowl',
        'sheet pan',
        'baking sheet',
      ];

      const instructions = parsedRecipe.instructions || [];
      instructions.forEach((instruction, index) => {
        const detail =
          typeof instruction === 'string'
            ? instruction
            : instruction.detail || '';
        const detailLower = detail.toLowerCase();

        commonTools.forEach((tool) => {
          if (
            detailLower.includes(tool.toLowerCase()) &&
            fuzzyMatch(searchTerm, tool)
          ) {
            // Avoid duplicates
            if (!results.find((r) => r.id === `tool-${index}-${tool}`)) {
              results.push({
                id: `tool-${index}-${tool}`,
                type: 'tool',
                title: tool.charAt(0).toUpperCase() + tool.slice(1),
                subtitle: `Step ${index + 1}`,
                content: detail.slice(0, 80) + (detail.length > 80 ? '...' : ''),
                elementId: `step-${index}`,
                stepNumber: index + 1,
              });
            }
          }
        });
      });
    }

    // Search metadata
    if (parsedQuery.type === 'metadata' || parsedQuery.type === 'all') {
      const metadataFields = [
        { key: 'title', value: parsedRecipe.title },
        { key: 'author', value: parsedRecipe.author },
        { key: 'sourceUrl', value: parsedRecipe.sourceUrl },
        { key: 'summary', value: parsedRecipe.summary },
        { key: 'description', value: parsedRecipe.description },
        {
          key: 'cuisine',
          value: parsedRecipe.cuisine?.join(', '),
        },
      ];

      metadataFields.forEach((field) => {
        if (field.value && fuzzyMatch(searchTerm, String(field.value))) {
          results.push({
            id: `meta-${field.key}`,
            type: 'metadata',
            title: field.key.charAt(0).toUpperCase() + field.key.slice(1),
            subtitle: String(field.value).slice(0, 80),
            content: String(field.value),
          });
        }
      });
    }

    return results;
  }, [parsedRecipe, parsedQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.elementId) {
      // Close modal first
      onClose();

      // Small delay to ensure modal closes before scrolling
      setTimeout(() => {
        scrollToElement(result.elementId!);
      }, 100);
    } else {
      // For metadata without element IDs, just close
      onClose();
    }
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in the input
      if (e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, handleResultSelect]);

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, results.length]);


  // Get icon for result type
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'ingredient':
        return <Carrot className="w-4 h-4 text-orange-500" />;
      case 'step':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'tool':
        return <Wrench className="w-4 h-4 text-purple-500" />;
      case 'metadata':
        return <Info className="w-4 h-4 text-green-500" />;
    }
  };

  // Get badge color for result type
  const getBadgeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'ingredient':
        return 'bg-orange-100 text-orange-700';
      case 'step':
        return 'bg-blue-100 text-blue-700';
      case 'tool':
        return 'bg-purple-100 text-purple-700';
      case 'metadata':
        return 'bg-green-100 text-green-700';
    }
  };

  if (!parsedRecipe) {
    return (
      <div className="p-8 text-center">
        <p className="font-albert text-sm text-stone-500">
          No recipe loaded. Open a recipe to search within it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 border-b border-[#d9d9d9]">
        <div className="flex items-center gap-2 bg-stone-50 rounded-lg border border-[#d9d9d9] px-3 py-2 focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5] transition-all">
          <Search className="w-4 h-4 text-stone-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients, steps, tools..."
            className="flex-1 bg-transparent font-albert text-sm text-stone-800 placeholder:text-stone-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-stone-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-stone-500" />
            </button>
          )}
        </div>
        {parsedQuery.type !== 'all' && (
          <div className="mt-2">
            <span className="font-albert text-xs text-stone-500">
              Filtering by: <span className="font-medium">{parsedQuery.type}</span>
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      <div
        ref={resultsRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {query.trim() === '' ? (
          <div className="text-center py-12">
            <p className="font-albert text-sm text-stone-500">
              Start typing to search within this recipe
            </p>
            <p className="font-albert text-xs text-stone-400 mt-2">
              Try: "butter", "step:mix", "ingredient:garlic"
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-albert text-sm text-stone-500">
              No results found for "{query}"
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                  index === selectedIndex
                    ? 'bg-[#4F46E5]/10 border border-[#4F46E5]/20'
                    : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-albert text-xs font-medium px-2 py-0.5 rounded ${getBadgeColor(
                        result.type,
                      )}`}
                    >
                      {result.type}
                    </span>
                    {result.stepNumber && (
                      <span className="font-albert text-xs text-stone-500">
                        Step {result.stepNumber}
                      </span>
                    )}
                    {result.groupName && (
                      <span className="font-albert text-xs text-stone-500">
                        {result.groupName}
                      </span>
                    )}
                  </div>
                  <div className="font-albert font-medium text-sm text-stone-800">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="font-albert text-xs text-stone-500 mt-1 line-clamp-2">
                      {result.subtitle}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5 opacity-0 md:group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {results.length > 0 && (
        <div className="px-4 py-2 border-t border-[#d9d9d9] bg-stone-50">
          <p className="font-albert text-xs text-stone-500 text-center">
            {results.length} result{results.length !== 1 ? 's' : ''} • Use ↑↓ to navigate, Enter to select
          </p>
        </div>
      )}
    </div>
  );
}

