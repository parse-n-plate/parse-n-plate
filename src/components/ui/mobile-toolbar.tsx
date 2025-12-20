'use client';

import React, { useState } from 'react';
import { Timer, Users, BookmarkPlus, Check, Minus, Plus, X } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';
import { useRecipe } from '@/contexts/RecipeContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MobileToolbar Component
 * 
 * A fixed bottom toolbar that appears on mobile devices only.
 * Provides quick access to:
 * - Timer: Shows active timers count and quick timer info
 * - Servings: Quick servings adjustment with +/- controls
 * - Add to Library: Save the current recipe to your collection
 * 
 * Design: Pill-shaped container with icons, similar to iOS navigation
 */

interface MobileToolbarProps {
  // Current servings value
  servings: number;
  // Callback when servings change
  onServingsChange: (servings: number) => void;
}

export function MobileToolbar({ servings, onServingsChange }: MobileToolbarProps) {
  // Get active timers from TimerContext
  const { activeTimers } = useTimer();
  
  // Get library functions from ParsedRecipesContext
  const { addRecipe, recentRecipes } = useParsedRecipes();
  
  // Get current recipe data
  const { parsedRecipe } = useRecipe();
  
  // Track which panel is open (null = none, 'timer' | 'servings' | 'library')
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  // Track if recipe was just saved (for success feedback)
  const [justSaved, setJustSaved] = useState(false);

  // Count of active timers for badge display
  const activeTimerCount = activeTimers.length;

  // Check if current recipe is already in library
  const isInLibrary = parsedRecipe?.sourceUrl 
    ? recentRecipes.some(r => r.url === parsedRecipe.sourceUrl)
    : false;

  // Handle adding recipe to library
  const handleAddToLibrary = () => {
    if (!parsedRecipe || isInLibrary) return;
    
    // Add the recipe to the library
    addRecipe({
      title: parsedRecipe.title || 'Untitled Recipe',
      summary: parsedRecipe.summary || '',
      url: parsedRecipe.sourceUrl || '',
      imageUrl: parsedRecipe.imageUrl,
      ingredients: parsedRecipe.ingredients,
      instructions: parsedRecipe.instructions,
      author: parsedRecipe.author,
      sourceUrl: parsedRecipe.sourceUrl,
    });
    
    // Show success feedback
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Toggle panel visibility
  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Format time remaining for timer display
  const formatTimeLeft = (timer: { startTime: number; durationMinutes: number }) => {
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const remaining = Math.max(0, (timer.durationMinutes * 60) - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* 
        ═══════════════════════════════════════════════════════════════
        BACKDROP OVERLAY
        Shows when a panel is open to allow dismissing by tapping outside
        ═══════════════════════════════════════════════════════════════ 
      */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-toolbar-backdrop"
            onClick={() => setActivePanel(null)}
          />
        )}
      </AnimatePresence>

      {/* 
        ═══════════════════════════════════════════════════════════════
        EXPANDABLE PANELS
        These appear above the toolbar when their button is tapped
        ═══════════════════════════════════════════════════════════════ 
      */}
      <AnimatePresence>
        {/* Timer Panel */}
        {activePanel === 'timer' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mobile-toolbar-panel"
          >
            <div className="mobile-toolbar-panel-header">
              <span className="mobile-toolbar-panel-title">Active Timers</span>
              <button 
                className="mobile-toolbar-panel-close"
                onClick={() => setActivePanel(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {activeTimerCount === 0 ? (
              <div className="mobile-toolbar-panel-empty">
                <Timer className="mobile-toolbar-panel-empty-icon" />
                <p className="mobile-toolbar-panel-empty-title">No active timers</p>
                <p className="mobile-toolbar-panel-empty-description">Start a timer from any step in Cook mode</p>
              </div>
            ) : (
              <div className="mobile-toolbar-timer-list">
                {activeTimers.map((timer) => (
                  <div key={timer.stepNumber} className="mobile-toolbar-timer-item">
                    <div className="mobile-toolbar-timer-info">
                      <span className="mobile-toolbar-timer-label">{timer.label}</span>
                      <span className="mobile-toolbar-timer-time">{formatTimeLeft(timer)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Servings Panel */}
        {activePanel === 'servings' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mobile-toolbar-panel"
          >
            <div className="mobile-toolbar-panel-header">
              <span className="mobile-toolbar-panel-title">Adjust Servings</span>
              <button 
                className="mobile-toolbar-panel-close"
                onClick={() => setActivePanel(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mobile-toolbar-servings-control">
              <button
                onClick={() => servings > 1 && onServingsChange(servings - 1)}
                disabled={servings <= 1}
                className="mobile-toolbar-servings-btn"
                aria-label="Decrease servings"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="mobile-toolbar-servings-display">
                <span className="mobile-toolbar-servings-value">{servings}</span>
                <span className="mobile-toolbar-servings-unit">servings</span>
              </div>
              
              <button
                onClick={() => servings < 20 && onServingsChange(servings + 1)}
                disabled={servings >= 20}
                className="mobile-toolbar-servings-btn"
                aria-label="Increase servings"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ═══════════════════════════════════════════════════════════════
        MAIN TOOLBAR
        Fixed at bottom, pill-shaped container with 3 action buttons
        ═══════════════════════════════════════════════════════════════ 
      */}
      <div className="mobile-toolbar-container">
        <div className="mobile-toolbar">
          {/* Timer Button */}
          <button
            onClick={() => togglePanel('timer')}
            className={`mobile-toolbar-btn ${activePanel === 'timer' ? 'mobile-toolbar-btn-active' : ''}`}
            aria-label={`Timers${activeTimerCount > 0 ? ` (${activeTimerCount} active)` : ''}`}
          >
            <div className="mobile-toolbar-btn-inner">
              <Timer className="mobile-toolbar-icon" />
              {/* Badge for active timer count */}
              {activeTimerCount > 0 && (
                <span className="mobile-toolbar-badge">{activeTimerCount}</span>
              )}
            </div>
          </button>

          {/* Servings Button */}
          <button
            onClick={() => togglePanel('servings')}
            className={`mobile-toolbar-btn ${activePanel === 'servings' ? 'mobile-toolbar-btn-active' : ''}`}
            aria-label="Adjust servings"
          >
            <div className="mobile-toolbar-btn-inner">
              <Users className="mobile-toolbar-icon" />
            </div>
          </button>

          {/* Add to Library Button */}
          <button
            onClick={handleAddToLibrary}
            disabled={isInLibrary || justSaved}
            className={`mobile-toolbar-btn ${isInLibrary || justSaved ? 'mobile-toolbar-btn-saved' : ''}`}
            aria-label={isInLibrary ? 'Already in library' : 'Add to library'}
          >
            <div className="mobile-toolbar-btn-inner">
              <AnimatePresence mode="wait">
                {isInLibrary || justSaved ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2, type: 'spring' }}
                  >
                    <Check className="mobile-toolbar-icon mobile-toolbar-icon-success" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bookmark"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2, type: 'spring' }}
                  >
                    <BookmarkPlus className="mobile-toolbar-icon" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

