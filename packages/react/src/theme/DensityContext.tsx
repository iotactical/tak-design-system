import { createContext, useContext, type ReactNode } from 'react';

export type DensityMode = 'mobile' | 'desktop';

interface DensityContextValue {
  density: DensityMode;
}

const DensityContext = createContext<DensityContextValue>({ density: 'mobile' });

export interface DensityProviderProps {
  children: ReactNode;
  density?: DensityMode;
}

export function DensityProvider({ children, density = 'mobile' }: DensityProviderProps) {
  return (
    <DensityContext.Provider value={{ density }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity(): DensityMode {
  const ctx = useContext(DensityContext);
  return ctx.density;
}
