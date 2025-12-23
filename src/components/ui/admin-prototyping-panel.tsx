'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Layout, MousePointer2, PanelRight, SquareStack, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUISettings, IngredientExpandStyle } from '@/contexts/UISettingsContext';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

export function AdminPrototypingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setIngredientExpandStyle } = useUISettings();
  const { settings: adminSettings, toggleShowIngredientStepTags, toggleShowIngredientsForStepList } = useAdminSettings();

  const styles: { id: IngredientExpandStyle; label: string; icon: React.ReactNode }[] = [
    { id: 'accordion', label: 'Accordion', icon: <ChevronRight className="h-4 w-4" /> },
    { id: 'modal', label: 'Modal', icon: <Layout className="h-4 w-4" /> },
    { id: 'sidepanel', label: 'Side Panel', icon: <PanelRight className="h-4 w-4" /> },
    { id: 'things3', label: 'Things 3', icon: <SquareStack className="h-4 w-4" /> },
    { id: 'mobile-drawer', label: 'Mobile Drawer', icon: <Smartphone className="h-4 w-4" /> },
  ];

  return (
    <div 
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 bg-white border border-r-0 border-[#E0E0E0] shadow-xl transition-transform duration-300 z-[100] rounded-l-xl flex",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-24px)]"
      )}
    >
      {/* Toggle Handle */}
      <div 
        className="w-6 flex items-center justify-center bg-stone-900 text-white rounded-l-xl cursor-pointer hover:bg-stone-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </div>

      <div className="w-64 p-4 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <MousePointer2 className="h-4 w-4 text-[#FFBA25]" />
          <h2 className="font-domine font-bold text-stone-900">Prototype Lab</h2>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-albert font-bold uppercase tracking-widest text-stone-400">Expand Style</h3>
          <div className="grid grid-cols-1 gap-2">
            {styles.map((style) => (
              <Button
                key={style.id}
                variant={settings.ingredientExpandStyle === style.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "justify-start h-9 w-full font-albert",
                  settings.ingredientExpandStyle === style.id ? "bg-stone-900" : "bg-white hover:bg-stone-50"
                )}
                onClick={() => setIngredientExpandStyle(style.id)}
              >
                <span className="mr-2 opacity-70">{style.icon}</span>
                <span className="text-xs font-albert">{style.label}</span>
                {settings.ingredientExpandStyle === style.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFBA25]" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Toggle Controls Section */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <h3 className="text-[10px] font-albert font-bold uppercase tracking-widest text-stone-400">Display Options</h3>
          
          {/* Toggle for Ingredient Step Tags */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-albert font-medium text-stone-900">Ingredient Step Tags</span>
              <span className="text-[10px] font-albert text-stone-400 mt-0.5">Show ingredient pills in step view</span>
            </div>
            <button
              onClick={toggleShowIngredientStepTags}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#193d34]/20 focus:ring-offset-2",
                adminSettings.showIngredientStepTags ? "bg-stone-900" : "bg-stone-200"
              )}
              aria-label="Toggle ingredient step tags"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  adminSettings.showIngredientStepTags ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Toggle for Ingredients List */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-albert font-medium text-stone-900">Ingredients for Step</span>
              <span className="text-[10px] font-albert text-stone-400 mt-0.5">Show ingredients list in context panel</span>
            </div>
            <button
              onClick={toggleShowIngredientsForStepList}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#193d34]/20 focus:ring-offset-2",
                adminSettings.showIngredientsForStepList ? "bg-stone-900" : "bg-stone-200"
              )}
              aria-label="Toggle ingredients for step list"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  adminSettings.showIngredientsForStepList ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] font-albert text-stone-400 italic">
            Select a style above, then click an ingredient to preview the interaction.
          </p>
        </div>
      </div>
    </div>
  );
}

