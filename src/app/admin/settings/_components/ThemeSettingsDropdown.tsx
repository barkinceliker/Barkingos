
"use client";

import { useState, useEffect } from "react";
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
import { THEME_OPTIONS, type ThemeName } from "@/lib/theme-config";
import { Loader2, Palette, Save } from "lucide-react";

const getThemeDisplayName = (themeKey: ThemeName): string => {
  if (themeKey === 'default') return 'Varsayılan (Açık)';
  return themeKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function applyThemeToHtml(themeName: ThemeName) {
  if (typeof window !== "undefined") {
    const htmlEl = document.documentElement;
    const currentClasses = Array.from(htmlEl.classList);
    console.log(`[ThemeSettingsDropdown applyThemeToHtml] ÇAĞRILDI. Uygulanacak tema: '${themeName}'. ÖNCEKİ <html> sınıfları: '${currentClasses.join(' ')}'`);
    
    const classesToRemove = currentClasses.filter(cls => cls.startsWith('theme-'));
    if (classesToRemove.length > 0) {
      classesToRemove.forEach(cls => htmlEl.classList.remove(cls));
      console.log(`[ThemeSettingsDropdown applyThemeToHtml] KALDIRILAN 'theme-*' sınıfları: '${classesToRemove.join(' ')}'. Kaldırma sonrası sınıflar: '${htmlEl.className}'`);
    } else {
      console.log(`[ThemeSettingsDropdown applyThemeToHtml] Kaldırılacak 'theme-*' sınıfı bulunamadı.`);
    }

    if (themeName !== 'default') {
      htmlEl.classList.add(`theme-${themeName}`);
      console.log(`[ThemeSettingsDropdown applyThemeToHtml] EKLENEN YENİ TEMA SINIFI: 'theme-${themeName}'. SONRAKİ <html> sınıfları: '${htmlEl.className}'`);
    } else {
       console.log(`[ThemeSettingsDropdown applyThemeToHtml] Tema 'default' olduğu için 'theme-*' sınıfı eklenmedi. SONRAKİ <html> sınıfları: '${htmlEl.className}'`);
    }
  } else {
    console.warn("[ThemeSettingsDropdown applyThemeToHtml] 'window' tanımsız. Tema uygulanamadı (Bu SSR'da beklenir).");
  }
}

export default function ThemeSettingsDropdown() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('default');
  const [dbTheme, setDbTheme] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentTheme() {
      setIsLoading(true);
      console.log("[ThemeSettingsDropdown useEffect] İLK YÜKLEME: Sunucudan başlangıç teması çekiliyor...");
      try {
        const setting = await getThemeSetting(); 
        const themeToApply = setting?.activeTheme || 'default';
        setSelectedTheme(themeToApply);
        setDbTheme(themeToApply);
        console.log(`[ThemeSettingsDropdown useEffect] İLK YÜKLEME: Sunucudan gelen tema: '${themeToApply}'.`);
        // Initial client-side application isn't strictly necessary here if RootLayout handles it,
        // but can be kept for consistency if there's a flash.
        // applyThemeToHtml(themeToApply); 
      } catch (error) {
        console.error("[ThemeSettingsDropdown useEffect] İLK YÜKLEME: Mevcut tema yüklenirken hata:", error);
        toast({
          title: "Hata",
          description: "Mevcut tema ayarı yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        console.log("[ThemeSettingsDropdown useEffect] İLK YÜKLEME: Tema yükleme tamamlandı.");
      }
    }
    fetchCurrentTheme();
  }, [toast]); 

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as ThemeName);
  };

  const handleSaveTheme = async () => {
    if (selectedTheme === dbTheme && !isSaving) {
      toast({ title: "Bilgi", description: "Tema zaten güncel." });
      return;
    }
    console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 1: Tema '${selectedTheme}' olarak kaydedilecek. Mevcut veritabanı teması: '${dbTheme}'. Sunucuya gönderiliyor...`);
    setIsSaving(true);
    try {
      const result = await updateThemeSetting(selectedTheme); 
      console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 2: updateThemeSetting ('${selectedTheme}' için) sunucu yanıtı:`, result);

      if (result.success) {
        setDbTheme(selectedTheme); // Update dbTheme state on successful save
        console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 3A: Sunucu güncellemesi başarılı. İstemci durumu '${selectedTheme}' olarak ayarlandı.`);
        console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 3B: İstemci tarafı anlık önizleme için applyThemeToHtml('${selectedTheme}') çağrılıyor.`);
        applyThemeToHtml(selectedTheme); 
        
        toast({
          title: "Başarılı!",
          description: `${getThemeDisplayName(selectedTheme)} teması başarıyla uygulandı ve kaydedildi. Değişikliklerin tam olarak yansıması için sayfa yenileniyor...`,
        });
        
        console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 4: Sunucu tarafı Layout'u yenilemek için router.refresh() çağrılıyor ('${selectedTheme}' için)...`);
        router.refresh(); 
        console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 5: router.refresh() çağrıldı ('${selectedTheme}' için). Sunucu RootLayout'u yeniden render etmeli.`);
      } else {
        toast({
          title: "Tema Güncellenemedi!",
          description: result.message || "Tema güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
         console.error(`[ThemeSettingsDropdown handleSaveTheme] Sunucu tarafında tema güncelleme BAŞARISIZ OLDU: ${result.message}`);
         // Başarısızlık durumunda, istemciyi mevcut (eski/veritabanındaki) temaya geri döndür
         console.log(`[ThemeSettingsDropdown handleSaveTheme] BAŞARISIZLIK: İstemci tarafı anlık önizleme '${dbTheme}' (veritabanındaki tema) olarak geri alınıyor.`);
         applyThemeToHtml(dbTheme);
         setSelectedTheme(dbTheme); // Reset select to db theme
      }
    } catch (error: any) {
      console.error("[ThemeSettingsDropdown handleSaveTheme] Tema kaydetme sırasında İSTEMCİ TARAFINDA GENEL HATA yakalandı:", error);
      toast({
        title: "İstemci Hatası!",
        description: error.message || "Tema güncellenemedi.",
        variant: "destructive",
      });
      console.log(`[ThemeSettingsDropdown handleSaveTheme] GENEL HATA: İstemci tarafı anlık önizleme '${dbTheme}' (veritabanındaki tema) olarak geri alınıyor.`);
      applyThemeToHtml(dbTheme);
      setSelectedTheme(dbTheme); // Reset select to db theme
    } finally {
      setIsSaving(false);
      console.log(`[ThemeSettingsDropdown handleSaveTheme] ADIM 6: Tema seçim işlemi tamamlandı ('${selectedTheme}').`);
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
          Aşağıdaki listeden bir tema seçerek sitenizin görünümünü değiştirin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme-select" className="text-sm font-medium">Tema Seçin</Label>
          <Select
            value={selectedTheme}
            onValueChange={handleThemeChange}
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
          <p className="text-xs text-muted-foreground mt-1">
            Seçiminiz anlık olarak önizlenecektir. Kalıcı olması için 'Kaydet' butonuna tıklayın.
          </p>
        </div>
        <Button
          onClick={handleSaveTheme}
          disabled={isLoading || isSaving || selectedTheme === dbTheme}
          className="w-full"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Temayı Kaydet
        </Button>
      </CardContent>
    </Card>
  );
}
