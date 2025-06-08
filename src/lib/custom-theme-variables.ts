
// src/lib/custom-theme-variables.ts

// Bu dosyada, özel tema formunda kullanılacak CSS değişkenlerinin listesini
// ve varsayılan başlangıç değerlerini tanımlıyoruz.
// Değerler HSL formatında (örneğin, "220 17% 95%") veya geçerli CSS değeri (örneğin, "0.5rem") olmalıdır.

export interface ThemeVariable {
  name: string; // CSS değişken adı (örn: --background)
  label: string; // Formda görünecek etiket
  defaultValue: string; // Varsayılan HSL veya CSS değeri
  type?: 'color' | 'text' | 'size'; // Formda input tipini belirlemek için (varsayılan text)
  description?: string; // Formda gösterilecek açıklama
}

export const CORE_THEME_VARIABLES: ThemeVariable[] = [
  // Ana Renkler
  { name: '--background', label: 'Arka Plan Rengi', defaultValue: '0 0% 100%', type: 'color', description: 'Sitenin ana arka plan rengi (açık tema tabanı).' },
  { name: '--foreground', label: 'Ön Plan Rengi (Yazı)', defaultValue: '220 10% 20%', type: 'color', description: 'Ana metin rengi (açık tema tabanı).' },
  { name: '--card', label: 'Kart Arka Planı', defaultValue: '0 0% 100%', type: 'color' },
  { name: '--card-foreground', label: 'Kart Ön Planı (Yazı)', defaultValue: '220 10% 20%', type: 'color' },
  { name: '--popover', label: 'Popover Arka Planı', defaultValue: '0 0% 100%', type: 'color' },
  { name: '--popover-foreground', label: 'Popover Ön Planı (Yazı)', defaultValue: '220 10% 20%', type: 'color' },
  { name: '--primary', label: 'Birincil Renk', defaultValue: '231 48% 48%', type: 'color', description: 'Ana marka rengi, butonlar, vurgular vb.' },
  { name: '--primary-foreground', label: 'Birincil Renk Üzeri Yazı', defaultValue: '0 0% 100%', type: 'color', description: 'Birincil renk arka planında kullanılacak yazı rengi.' },
  { name: '--secondary', label: 'İkincil Renk', defaultValue: '220 10% 90%', type: 'color', description: 'İkincil marka rengi, destekleyici elemanlar.' },
  { name: '--secondary-foreground', label: 'İkincil Renk Üzeri Yazı', defaultValue: '231 48% 48%', type: 'color' },
  { name: '--muted', label: 'Sessiz Renk (Muted)', defaultValue: '220 10% 85%', type: 'color', description: 'Daha az önemli elemanlar için soluk renk.' },
  { name: '--muted-foreground', label: 'Sessiz Renk Üzeri Yazı', defaultValue: '220 10% 45%', type: 'color' },
  { name: '--accent', label: 'Vurgu Rengi (Accent)', defaultValue: '174 100% 29%', type: 'color', description: 'Dikkat çekici elemanlar, linkler için renk.' },
  { name: '--accent-foreground', label: 'Vurgu Rengi Üzeri Yazı', defaultValue: '0 0% 100%', type: 'color' },
  { name: '--destructive', label: 'Yıkıcı Eylem Rengi', defaultValue: '0 84.2% 60.2%', type: 'color', description: 'Silme gibi tehlikeli eylemler için renk.' },
  { name: '--destructive-foreground', label: 'Yıkıcı Eylem Üzeri Yazı', defaultValue: '0 0% 98%', type: 'color' },
  
  // Diğer Elemanlar
  { name: '--border', label: 'Kenarlık Rengi', defaultValue: '220 10% 80%', type: 'color' },
  { name: '--input', label: 'Giriş Alanı Arka Planı', defaultValue: '220 10% 88%', type: 'color' },
  { name: '--ring', label: 'Odak Halkası Rengi', defaultValue: '231 48% 48%', type: 'color', description: 'Odaklanmış elemanların etrafındaki halka rengi (genellikle birincil renk).' },
  { name: '--radius', label: 'Köşe Yarıçapı', defaultValue: '0.5rem', type: 'size', description: 'Elemanların köşe yuvarlaklığı (örn: 0.5rem, 8px).' },

  // Grafik Renkleri
  { name: '--chart-1', label: 'Grafik Rengi 1', defaultValue: '12 76% 61%', type: 'color' },
  { name: '--chart-2', label: 'Grafik Rengi 2', defaultValue: '173 58% 39%', type: 'color' },
  { name: '--chart-3', label: 'Grafik Rengi 3', defaultValue: '197 37% 24%', type: 'color' },
  { name: '--chart-4', label: 'Grafik Rengi 4', defaultValue: '43 74% 66%', type: 'color' },
  { name: '--chart-5', label: 'Grafik Rengi 5', defaultValue: '27 87% 67%', type: 'color' },

  // İnce Ayarlar (Örnekler, globals.css'teki :root'a göre)
  // Bu değişkenler doğrudan tema tarafından ayarlanır, hsl(var(--ana-degisken)) şeklinde değil.
  { name: '--blockquote-bg', label: 'Alıntı Arka Planı', defaultValue: '220 10% 92.5%', type: 'color', description: '--secondary / 0.5 gibi bir değer yerine direkt HSL.' },
  { name: '--blockquote-border', label: 'Alıntı Kenarlığı', defaultValue: '174 100% 29%', type: 'color' },
  { name: '--blockquote-text', label: 'Alıntı Yazısı', defaultValue: '220 10% 28.75%', type: 'color', description: '--foreground / 0.85 gibi bir değer yerine direkt HSL.' },
  { name: '--code-bg', label: 'Kod Bloğu Arka Planı', defaultValue: '220 10% 85%', type: 'color' },
  { name: '--code-text', label: 'Kod Bloğu Yazısı', defaultValue: '220 10% 45%', type: 'color' },
  { name: '--separator-color', label: 'Ayırıcı Çizgi Rengi', defaultValue: '220 10% 80%', type: 'color' },
  { name: '--toast-bg', label: 'Bildirim Arka Planı', defaultValue: '0 0% 100%', type: 'color' },
  { name: '--toast-text', label: 'Bildirim Yazısı', defaultValue: '220 10% 20%', type: 'color' },
  { name: '--toast-border', label: 'Bildirim Kenarlığı', defaultValue: '220 10% 80%', type: 'color' },
];

// Bu, Zod şeması ve form oluştururken kullanılacak.
export const customThemeVariableNames = CORE_THEME_VARIABLES.map(v => v.name);

export type CustomThemeValues = {
  [key in typeof CORE_THEME_VARIABLES[number]['name']]: string;
} & {
  themeName: string; // Kullanıcının temaya verdiği isim (unique olmalı)
  themeDisplayName: string; // Formda ve listede gösterilecek isim
};

export const DEFAULT_CUSTOM_THEME_VALUES: CustomThemeValues = CORE_THEME_VARIABLES.reduce((acc, variable) => {
  acc[variable.name as keyof Omit<CustomThemeValues, 'themeName' | 'themeDisplayName'>] = variable.defaultValue;
  return acc;
}, {} as CustomThemeValues);

DEFAULT_CUSTOM_THEME_VALUES.themeName = '';
DEFAULT_CUSTOM_THEME_VALUES.themeDisplayName = '';

