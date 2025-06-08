
export const THEME_OPTIONS = ['default', 'ocean-depth', 'cyber-punk'] as const;
export type ThemeName = (typeof THEME_OPTIONS)[number];
