'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

export type IngredientExpandStyle = 'accordion' | 'modal' | 'sidepanel' | 'things3';

type UISettingsState = {
  ingredientExpandStyle: IngredientExpandStyle;
};

type UISettingsContextType = {
  settings: UISettingsState;
  isReady: boolean;
  setIngredientExpandStyle: (style: IngredientExpandStyle) => void;
};

const STORAGE_KEY = 'uiSettings';

const defaultSettings: UISettingsState = {
  ingredientExpandStyle: 'things3',
};

const UISettingsContext = createContext<UISettingsContextType | undefined>(
  undefined,
);

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UISettingsState>(defaultSettings);
  const [isReady, setIsReady] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UISettingsState>;
        setSettings({
          ingredientExpandStyle:
            parsed.ingredientExpandStyle ?? defaultSettings.ingredientExpandStyle,
        });
      }
    } catch (error) {
      console.error('Error reading UI settings from localStorage:', error);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Persist settings whenever they change (after first load)
  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving UI settings to localStorage:', error);
    }
  }, [isReady, settings]);

  const setIngredientExpandStyle = (style: IngredientExpandStyle) => {
    setSettings((prev) => ({ ...prev, ingredientExpandStyle: style }));
  };

  const value = useMemo(
    () => ({
      settings,
      isReady,
      setIngredientExpandStyle,
    }),
    [settings, isReady],
  );

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  const context = useContext(UISettingsContext);
  if (!context) {
    throw new Error('useUISettings must be used within a UISettingsProvider');
  }
  return context;
}

