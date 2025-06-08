
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getThemeSetting, updateThemeSetting } from "@/lib/actions/settings-actions";
import { THEME_OPTIONS, type ThemeName } from "@/lib/theme-config";
import { CheckCircle, Palette, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const getThemeDisplayName = (themeKey: ThemeName): string => {
  if (themeKey === 'default') return 'Varsayılan (Açık)';
  return themeKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getThemePreviewColors = (themeKey: ThemeName): { primary: string; accent: string; background: string } => {
  // Bu fonksiyon içeriği bir önceki versiyondaki gibi kalacak, yer kaplamaması için kısaltıldı.
  // Gerekirse tam içeriği tekrar eklenebilir.
  switch (themeKey) {
    case 'default': return { primary: 'hsl(231 48% 48%)', accent: 'hsl(174 100% 29%)', background: 'hsl(220 17% 95%)' }; 
    case 'ocean-depth': return { primary: 'hsl(180 65% 55%)', accent: 'hsl(30 85% 60%)', background: 'hsl(205 50% 12%)' }; 
    case 'cyber-punk': return { primary: 'hsl(180 100% 50%)', accent: 'hsl(60 100% 55%)', background: 'hsl(270 70% 7%)' }; 
    case 'midnight-gradient': return { primary: 'hsl(0 0% 98%)', accent: 'hsl(0 0% 70%)', background: 'hsl(0 0% 3.9%)' }; // Updated for black theme
    case 'forest-green': return { primary: 'hsl(130 55% 45%)', accent: 'hsl(90 60% 50%)', background: 'hsl(120 20% 96%)' }; 
    case 'deep-navy': return { primary: 'hsl(200 80% 60%)', accent: 'hsl(250 70% 65%)', background: 'hsl(220 40% 10%)' }; 
    case 'blush-pink': return { primary: 'hsl(330 70% 55%)', accent: 'hsl(300 70% 60%)', background: 'hsl(340 80% 97%)' }; 
    case 'royal-purple': return { primary: 'hsl(280 70% 60%)', accent: 'hsl(310 80% 65%)', background: 'hsl(270 50% 15%)' }; 
    case 'burnt-orange': return { primary: 'hsl(20 85% 55%)', accent: 'hsl(40 90% 60%)', background: 'hsl(30 60% 95%)' }; 
    case 'crimson-red': return { primary: 'hsl(0 70% 50%)', accent: 'hsl(30 80% 60%)', background: 'hsl(0 0% 12%)' }; 
    default: return { primary: 'hsl(0 0% 50%)', accent: 'hsl(0 0% 60%)', background: 'hsl(0 0% 90%)' }; 
  }
};

function applyThemeToHtml(themeName: ThemeName) {
  if (typeof window !== "undefined") {
    const htmlEl = document.documentElement;
    const currentClasses = Array.from(htmlEl.classList);
    console.log(`[ThemeSelectorCard applyThemeToHtml] ÇAĞRILDI. Uygulanacak tema: '${themeName}'. ÖNCEKİ <html> sınıfları: '${currentClasses.join(' ')}'`);
    
    const classesToRemove = currentClasses.filter(cls => cls.startsWith('theme-'));
    if (classesToRemove.length > 0) {
      classesToRemove.forEach(cls => htmlEl.classList.remove(cls));
      console.log(`[ThemeSelectorCard applyThemeToHtml] KALDIRILAN 'theme-*' sınıfları: '${classesToRemove.join(' ')}'. Kaldırma sonrası sınıflar: '${htmlEl.className}'`);
    } else {
      console.log(`[ThemeSelectorCard applyThemeToHtml] Kaldırılacak 'theme-*' sınıfı bulunamadı.`);
    }

    if (themeName !== 'default') {
      htmlEl.classList.add(`theme-${themeName}`);
      console.log(`[ThemeSelectorCard applyThemeToHtml] EKLENEN YENİ TEMA SINIFI: 'theme-${themeName}'. SONRAKİ <html> sınıfları: '${htmlEl.className}'`);
    } else {
       console.log(`[ThemeSelectorCard applyThemeToHtml] Tema 'default' olduğu için 'theme-*' sınıfı eklenmedi. SONRAKİ <html> sınıfları: '${htmlEl.className}'`);
    }
  } else {
    console.warn("[ThemeSelectorCard applyThemeToHtml] 'window' tanımsız. Tema uygulanamadı (Bu SSR'da beklenir).");
  }
}


export default function ThemeSelectorCard() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<ThemeName | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentTheme() {
      setIsLoading(true);
      console.log("[ThemeSelectorCard useEffect] İLK YÜKLEME: Sunucudan başlangıç teması çekiliyor...");
      try {
        const setting = await getThemeSetting(); 
        const themeToApply = setting?.activeThemeName || 'default'; // CORRECTED: activeTheme -> activeThemeName
        setCurrentTheme(themeToApply);
        console.log(`[ThemeSelectorCard useEffect] İLK YÜKLEME: Sunucudan gelen tema: '${themeToApply}'. Şimdi applyThemeToHtml çağrılıyor.`);
        applyThemeToHtml(themeToApply); 
      } catch (error) {
        console.error("[ThemeSelectorCard useEffect] İLK YÜKLEME: Mevcut tema yüklenirken hata:", error);
        toast({
          title: "Hata",
          description: "Mevcut tema ayarı yüklenemedi.",
          variant: "destructive",
        });
        console.log("[ThemeSelectorCard useEffect] İLK YÜKLEME: Hata oluştu, varsayılan tema ('default') uygulanıyor.");
        applyThemeToHtml('default'); 
      } finally {
        setIsLoading(false);
        console.log("[ThemeSelectorCard useEffect] İLK YÜKLEME: Tema yükleme ve uygulama tamamlandı.");
      }
    }
    fetchCurrentTheme();
  }, [toast]); 

  const handleThemeSelect = async (themeName: ThemeName) => {
    if (themeName === currentTheme && !isSaving) {
      console.log(`[ThemeSelectorCard handleThemeSelect] Tema zaten '${themeName}'. İşlem yok.`);
      return;
    }
    console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 1: Tema '${themeName}' seçildi. Mevcut tema: '${currentTheme}'. Sunucuya gönderiliyor...`);
    setIsSaving(themeName);
    try {
      const result = await updateThemeSetting(themeName); 
      console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 2: updateThemeSetting ('${themeName}' için) sunucu yanıtı:`, result);

      if (result.success) {
        console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 3A: Sunucu güncellemesi başarılı. İstemci durumu '${themeName}' olarak ayarlanıyor.`);
        setCurrentTheme(themeName); 
        console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 3B: İstemci tarafı anlık önizleme için applyThemeToHtml('${themeName}') çağrılıyor.`);
        applyThemeToHtml(themeName); 
        
        toast({
          title: "Başarılı!",
          description: `${getThemeDisplayName(themeName)} teması başarıyla uygulandı. Değişikliklerin tam olarak yansıması için sayfa yenileniyor...`,
        });
        
        console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 4: Sunucu tarafı Layout'u yenilemek için router.refresh() çağrılıyor ('${themeName}' için)...`);
        router.refresh(); 
        console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 5: router.refresh() çağrıldı ('${themeName}' için). Sunucu RootLayout'u yeniden render etmeli.`);
      } else {
        toast({
          title: "Tema Güncellenemedi!",
          description: result.message || "Tema güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
         console.error(`[ThemeSelectorCard handleThemeSelect] Sunucu tarafında tema güncelleme BAŞARISIZ OLDU: ${result.message}`);
         // Başarısızlık durumunda, istemciyi mevcut (eski) temaya geri döndürmek iyi bir fikir olabilir.
         console.log(`[ThemeSelectorCard handleThemeSelect] BAŞARISIZLIK: İstemci tarafı anlık önizleme '${currentTheme}' (eski tema) olarak geri alınıyor.`);
         applyThemeToHtml(currentTheme);
      }
    } catch (error: any) {
      console.error("[ThemeSelectorCard handleThemeSelect] Tema seçimi sırasında İSTEMCİ TARAFINDA GENEL HATA yakalandı:", error);
      toast({
        title: "İstemci Hatası!",
        description: error.message || "Tema güncellenemedi.",
        variant: "destructive",
      });
      // Genel hata durumunda da istemciyi mevcut (eski) temaya geri döndür
      console.log(`[ThemeSelectorCard handleThemeSelect] GENEL HATA: İstemci tarafı anlık önizleme '${currentTheme}' (eski tema) olarak geri alınıyor.`);
      applyThemeToHtml(currentTheme);
    } finally {
      setIsSaving(null);
      console.log(`[ThemeSelectorCard handleThemeSelect] ADIM 6: Tema seçim işlemi tamamlandı ('${themeName}').`);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
            <Palette className="mr-3 h-6 w-6" /> Temalar
          </CardTitle>
          <CardDescription>
            Site genelinde kullanılacak temayı seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Temalar yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center">
          <Palette className="mr-3 h-6 w-6" /> Temalar
        </CardTitle>
        <CardDescription>
          Aşağıdaki temalardan birini seçerek sitenizin görünümünü anında değiştirin.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {THEME_OPTIONS.map((themeKey) => {
          const displayName = getThemeDisplayName(themeKey);
          const previewColors = getThemePreviewColors(themeKey);
          const isActive = currentTheme === themeKey;

          return (
            <Card
              key={themeKey}
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-200 ease-in-out",
                "hover:shadow-2xl hover:scale-105",
                isActive ? "ring-2 ring-primary shadow-2xl scale-105" : "shadow-md"
              )}
              onClick={() => !isLoading && !isSaving && handleThemeSelect(themeKey)} 
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{displayName}</CardTitle>
                  {isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex space-x-2 h-16 rounded-md overflow-hidden border">
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColors.background }} title={`Arka Plan: ${previewColors.background}`}></div>
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColors.primary }} title={`Birincil: ${previewColors.primary}`}></div>
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColors.accent }} title={`Vurgu: ${previewColors.accent}`}></div>
                </div>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="w-full mt-4"
                  disabled={isSaving === themeKey || isActive || isLoading}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleThemeSelect(themeKey);
                  }}
                >
                  {isSaving === themeKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isActive ? "Aktif Tema" : "Bu Temayı Seç"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
    

    
