
// This file is no longer used as theme selection has been removed
// in favor of a fixed CSS-defined theme.
// Its content can be removed or the file itself can be deleted.

export const THEME_OPTIONS = [] as const;
export type ThemeName = string;
export type ThemePalette = Record<string, string>;
export const THEME_PALETTES: Record<ThemeName, ThemePalette> = {};
export const ALL_THEME_VARIABLE_KEYS: string[] = [];

console.warn("theme-config.ts is no longer actively used due to fixed CSS theming.");
