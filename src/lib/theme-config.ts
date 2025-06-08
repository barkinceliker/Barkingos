
export const THEME_OPTIONS = [
  'default', 
  'ocean-depth', 
  'cyber-punk',
  'midnight-gradient', // For "gradient güzel dark"
  'forest-green',      // For "yeşil"
  'deep-navy',         // For "lacivert"
  'blush-pink',        // For "pembe"
  'royal-purple',      // For "mor"
  'burnt-orange',      // For "turuncu"
  'crimson-red'        // For "kırmızı"
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number];
