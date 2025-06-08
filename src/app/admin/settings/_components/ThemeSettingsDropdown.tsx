
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getThemeSetting, updateThemeSetting } from "@/lib/actions/settings-actions";
import { THEME_OPTIONS, type ThemeName, THEME_PALETTES, type ThemePalette, ALL_THEME_VARIABLE_KEYS } from "@/lib/theme-config";
import { Loader2, Palette, Save } from "lucide-react";

const getThemeDisplayName = (themeKey: ThemeName): string => {
  if (themeKey === 'default') return 'Varsayılan (Açık)';
  return themeKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// İstemci tarafında anlık önizleme için CSS değişkenlerini doğrudan documentElement.style'a uygular
function applyClientSideThemePreview(themeName: ThemeName | null) {
  const logPrefix = "[ThemeSettingsDropdown applyClientSideThemePreview]";
  console.log(`${logPrefix} ÇAĞRILDI. Uygulanacak tema adı: '${themeName}'`);

  if (typeof window === "undefined") {
    console.warn(`${logPrefix} 'window' tanımsız. İstemci tarafı önizleme uygulanamadı.`);
    return;
  }
  const root = document.documentElement;

  // Önce mevcut tema sınıfını kaldır, sadece client-side preview için
  const currentThemeClasses = Array.from(root.classList).filter(cls => cls.startsWith('theme-'));
  currentThemeClasses.forEach(cls => root.classList.remove(cls));
  console.log(`${logPrefix} Önceki 'theme-*' sınıfları kaldırıldı. Mevcut sınıflar: '${root.className}'`);


  // Önceki dinamik olarak eklenmiş stilleri temizle (bu biraz kaba bir yöntem)
  // ALL_THEME_VARIABLE_KEYS, THEME_PALETTES.default içindeki tüm CSS değişken adlarını içermelidir.
  ALL_THEME_VARIABLE_KEYS.forEach(key => {
    root.style.removeProperty(key);
  });
  console.log(`${logPrefix} Önceki dinamik stiller (root.style üzerinden) temizlendi.`);


  if (themeName && THEME_PALETTES[themeName]) {
    const palette = THEME_PALETTES[themeName];
    console.log(`${logPrefix} '${themeName}' için palet bulundu. Değişkenler uygulanıyor...`, palette);
    Object.entries(palette).forEach(([variable, value]) => {
      // Değerler zaten HSL'nin içindeki sayılar olduğu için doğrudan `hsl(${value})` kullanıyoruz.
      root.style.setProperty(variable, `hsl(${value})`);
    });
    // Fallback veya non-variable stiller için sınıfı da ekleyelim
    if (themeName !== 'default') {
      root.classList.add(`theme-${themeName}`);
    }
    console.log(`${logPrefix} '${themeName}' teması ve sınıfı <html>'e uygulandı. HTML sınıfları: '${root.className}'`);
  } else if (themeName === 'default' || !themeName) {
    // 'default' tema veya tanımsız tema ise, stil özelliklerini kaldırarak globals.css'teki :root'a geri dönülür.
    // Yukarıda zaten tüm değişkenler temizlendiği için ekstra bir işlem gerekmeyebilir.
    // Sadece 'theme-default' sınıfı eklenmez.
    console.log(`${logPrefix} '${themeName || 'default'}' tema seçildi. Dinamik stiller temizlendi, globals.css :root geçerli olmalı.`);
  }
}


export default function ThemeSettingsDropdown() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('default');
  const [dbThemeName, setDbThemeName] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const logPrefix = "[ThemeSettingsDropdown useEffect]";
    async function fetchCurrentTheme() {
      setIsLoading(true);
      console.log(`${logPrefix} İLK YÜKLEME: Sunucudan başlangıç tema ayarı çekiliyor...`);
      try {
        const setting = await getThemeSetting();
        const themeNameToApply = setting?.activeThemeName || 'default';
        setSelectedTheme(themeNameToApply);
        setDbThemeName(themeNameToApply);
        console.log(`${logPrefix} İLK YÜKLEME: Sunucudan gelen tema adı: '${themeNameToApply}'.`);
        // İlk yüklemede anlık önizleme için applyClientSideThemePreview'ı çağırmaya gerek yok,
        // çünkü RootLayout zaten sunucudan gelen paletle stilleri enjekte ediyor.
        // Ancak, tutarlılık için veya sayfa geçişlerinde bir flash oluyorsa çağrılabilir.
        // applyClientSideThemePreview(themeNameToApply);
      } catch (error) {
        console.error(`${logPrefix} İLK YÜKLEME: Mevcut tema ayarı yüklenirken hata:`, error);
        toast({
          title: "Hata",
          description: "Mevcut tema ayarı yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        console.log(`${logPrefix} İLK YÜKLEME: Tema ayarı yükleme tamamlandı.`);
      }
    }
    fetchCurrentTheme();
  }, [toast]);

  const handleThemeChange = (value: string) => {
    const newThemeName = value as ThemeName;
    setSelectedTheme(newThemeName);
    console.log(`[ThemeSettingsDropdown handleThemeChange] Dropdown değeri değişti: '${newThemeName}'. Anlık önizleme uygulanıyor...`);
    applyClientSideThemePreview(newThemeName);
  };

  const handleSaveTheme = async () => {
    const logPrefix = "[ThemeSettingsDropdown handleSaveTheme]";
    if (selectedTheme === dbThemeName && !isSaving) {
      toast({ title: "Bilgi", description: "Tema zaten güncel." });
      return;
    }
    console.log(`${logPrefix} ADIM 1: Tema '${selectedTheme}' olarak kaydedilecek. Mevcut veritabanı tema adı: '${dbThemeName}'. Sunucuya gönderiliyor...`);
    setIsSaving(true);
    try {
      const result = await updateThemeSetting(selectedTheme);
      console.log(`${logPrefix} ADIM 2: updateThemeSetting ('${selectedTheme}' için) sunucu yanıtı:`, result);

      if (result.success) {
        setDbThemeName(selectedTheme);
        console.log(`${logPrefix} ADIM 3A: Sunucu güncellemesi başarılı. İstemci tarafı dbThemeName '${selectedTheme}' olarak ayarlandı.`);
        // applyClientSideThemePreview zaten handleThemeChange'de çağrıldığı için burada tekrar çağırmaya gerek yok,
        // ama kullanıcı direkt kaydete basarsa diye bir kontrol eklenebilir veya state'in güncel olduğundan emin olunur.
        // Anlık önizleme zaten seçili tema üzerinden yapılıyor.

        toast({
          title: "Başarılı!",
          description: `${getThemeDisplayName(selectedTheme)} teması başarıyla uygulandı ve kaydedildi. Değişikliklerin tam olarak yansıması için sayfa yenileniyor...`,
        });

        console.log(`${logPrefix} ADIM 4: Sunucu tarafı Layout'u yenilemek için router.refresh() çağrılıyor ('${selectedTheme}' için)...`);
        router.refresh();
        console.log(`${logPrefix} ADIM 5: router.refresh() çağrıldı ('${selectedTheme}' için). Sunucu RootLayout'u yeniden render etmeli.`);
      } else {
        toast({
          title: "Tema Güncellenemedi!",
          description: result.message || "Tema güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
        console.error(`${logPrefix} Sunucu tarafında tema güncelleme BAŞARISIZ OLDU: ${result.message}`);
        // Başarısızlık durumunda, istemciyi mevcut (eski/veritabanındaki) temaya geri döndür
        console.log(`${logPrefix} BAŞARISIZLIK: İstemci tarafı anlık önizleme '${dbThemeName}' (veritabanındaki tema adı) olarak geri alınıyor.`);
        applyClientSideThemePreview(dbThemeName);
        setSelectedTheme(dbThemeName); // Select'i de veritabanındaki temaya geri al
      }
    } catch (error: any) {
      console.error(`${logPrefix} Tema kaydetme sırasında İSTEMCİ TARAFINDA GENEL HATA yakalandı:`, error);
      toast({
        title: "İstemci Hatası!",
        description: error.message || "Tema güncellenemedi.",
        variant: "destructive",
      });
      console.log(`${logPrefix} GENEL HATA: İstemci tarafı anlık önizleme '${dbThemeName}' (veritabanındaki tema adı) olarak geri alınıyor.`);
      applyClientSideThemePreview(dbThemeName);
      setSelectedTheme(dbThemeName); // Select'i de veritabanındaki temaya geri al
    } finally {
      setIsSaving(false);
      console.log(`${logPrefix} ADIM 6: Tema seçim işlemi tamamlandı ('${selectedTheme}').`);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
            <Palette className="mr-3 h-6 w-6" /> Site Teması
          </CardTitle>
          <CardDescription>
            Site genelinde kullanılacak temayı seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[100px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Tema ayarları yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center">
          <Palette className="mr-3 h-6 w-6" /> Site Teması
        </CardTitle>
        <CardDescription>
          Aşağıdaki listeden bir tema seçerek sitenizin görünümünü değiştirin. Değişiklikler anlık olarak önizlenir. Kalıcı olması için "Temayı Kaydet" butonuna tıklayın.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme-select" className="text-sm font-medium">Tema Seçin</Label>
          <Select
            value={selectedTheme}
            onValueChange={handleThemeChange} // Bu fonksiyon anlık önizlemeyi tetikleyecek
            disabled={isLoading || isSaving}
          >
            <SelectTrigger id="theme-select" className="w-full mt-1">
              <SelectValue placeholder="Bir tema seçin..." />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((themeKey) => (
                <SelectItem key={themeKey} value={themeKey}>
                  {getThemeDisplayName(themeKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSaveTheme}
          disabled={isLoading || isSaving || selectedTheme === dbThemeName}
          className="w-full"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Temayı Kaydet
        </Button>
         {selectedTheme !== dbThemeName && !isSaving && (
          <p className="text-xs text-center text-amber-600">
            Seçili tema ('{getThemeDisplayName(selectedTheme)}') henüz kaydedilmedi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
