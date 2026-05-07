import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import './tak-tokens.css';

type ThemeMode = 'dark' | 'light';

interface TakThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const TakThemeContext = createContext<TakThemeContextValue | null>(null);

export interface TakThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function TakThemeProvider({ children, defaultMode = 'dark' }: TakThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const toggle = useCallback(() => setMode(m => (m === 'dark' ? 'light' : 'dark')), []);

  return (
    <TakThemeContext.Provider value={{ mode, setMode, toggle }}>
      <div data-tak-theme={mode}>
        {children}
      </div>
    </TakThemeContext.Provider>
  );
}

export function useTakTheme(): TakThemeContextValue {
  const ctx = useContext(TakThemeContext);
  if (!ctx) {
    throw new Error('useTakTheme must be used within a TakThemeProvider');
  }
  return ctx;
}
