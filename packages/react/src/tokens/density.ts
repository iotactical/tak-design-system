/**
 * Density tokens for mobile (ATAK) and desktop (WinTAK) modes.
 * Components consume these via the useDensity() hook to adjust sizing.
 */

export const mobileDensity = {
  buttonHeight: 40,     // ATAK: larger touch targets
  listItemHeight: 44,
  navButtonSize: 48,
  fontSize: 14,
  iconSize: 24,
} as const;

export const desktopDensity = {
  buttonHeight: 32,     // WinTAK: denser controls
  listItemHeight: 36,
  navButtonSize: 36,
  fontSize: 13,
  iconSize: 20,
} as const;

export type DensityTokens = typeof mobileDensity;
