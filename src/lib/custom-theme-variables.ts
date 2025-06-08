
// src/lib/custom-theme-variables.ts

// Bu dosya, özel tema yönetimi kaldırıldığı için artık aktif olarak kullanılmamaktadır.
// Önceden tanımlanmış temalar globals.css içinde ve tema seçimi settings-actions.ts üzerinden yönetilmektedir.

console.warn("custom-theme-variables.ts dosyası çağrıldı ancak özel tema yönetimi kaldırıldığı için işlevsizdir.");

export interface ThemeVariable {
  name: string; 
  label: string; 
  defaultValue: string; 
  type?: 'color' | 'text' | 'size'; 
  description?: string; 
}

export const CORE_THEME_VARIABLES: ThemeVariable[] = []; // Boş dizi

export const customThemeVariableNames: string[] = []; // Boş dizi

export type CustomThemeValues = {
  themeName?: string; 
  themeDisplayName?: string; 
};

export const DEFAULT_CUSTOM_THEME_VALUES: CustomThemeValues = {
  themeName: '',
  themeDisplayName: '',
};
