
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
  // Bu renkler globals.css'deki HSL değerleriyle eşleşmeli veya temsil etmeli
  switch (themeKey) {
    case 'default': return { primary: 'hsl(231 48% 48%)', accent: 'hsl(174 100% 29%)', background: 'hsl(220 17% 95%)' }; // Deep Blue, Teal, Light Gray
    case 'ocean-depth': return { primary: 'hsl(180 65% 55%)', accent: 'hsl(30 85% 60%)', background: 'hsl(205 50% 12%)' }; // Teal, Orange, Dark Blue
    case 'cyber-punk': return { primary: 'hsl(180 100% 50%)', accent: 'hsl(60 100% 55%)', background: 'hsl(270 70% 7%)' }; // Cyan, Yellow, Deep Purple
    case 'midnight-gradient': return { primary: 'hsl(280 80% 65%)', accent: 'hsl(180 90% 50%)', background: 'hsl(240 10% 4%)' }; // Purple, Teal, Very Dark Blue
    case 'forest-green': return { primary: 'hsl(130 55% 45%)', accent: 'hsl(90 60% 50%)', background: 'hsl(120 20% 96%)' }; // Forest Green, Lime Green, Light Green/Off-white
    case 'deep-navy': return { primary: 'hsl(200 80% 60%)', accent: 'hsl(250 70% 65%)', background: 'hsl(220 40% 10%)' }; // Bright Cyan, Indigo, Deep Navy
    case 'blush-pink': return { primary: 'hsl(330 70% 55%)', accent: 'hsl(300 70% 60%)', background: 'hsl(340 80% 97%)' }; // Strong Pink, Magenta, Light Pink
    case 'royal-purple': return { primary: 'hsl(280 70% 60%)', accent: 'hsl(310 80% 65%)', background: 'hsl(270 50% 15%)' }; // Royal Purple, Bright Pink, Dark Purple
    case 'burnt-orange': return { primary: 'hsl(20 85% 55%)', accent: 'hsl(40 90% 60%)', background: 'hsl(30 60% 95%)' }; // Burnt Orange, Gold, Light Cream
    case 'crimson-red': return { primary: 'hsl(0 70% 50%)', accent: 'hsl(30 80% 60%)', background: 'hsl(0 0% 12%)' }; // Crimson Red, Orange, Dark Gray
    default: return { primary: 'hsl(0 0% 50%)', accent: 'hsl(0 0% 60%)', background: 'hsl(0 0% 90%)' }; // Fallback
  }
};

export default function ThemeSelectorCard() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<ThemeName | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentTheme() {
      setIsLoading(true);
      try {
        const setting = await getThemeSetting();
        setCurrentTheme(setting.activeTheme);
        // Apply initial theme from DB to HTML element on client mount
        if (typeof window !== "undefined") {
          const htmlEl = document.documentElement;
          THEME_OPTIONS.forEach(opt => {
            if (opt !== 'default') htmlEl.classList.remove(`theme-${opt}`);
          });
          if (setting.activeTheme !== 'default') {
            htmlEl.classList.add(`theme-${setting.activeTheme}`);
          }
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: "Mevcut tema ayarı yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrentTheme();
  }, [toast]);

  const handleThemeSelect = async (themeName: ThemeName) => {
    if (themeName === currentTheme) return;
    setIsSaving(themeName);
    try {
      const result = await updateThemeSetting(themeName);
      if (result.success) {
        setCurrentTheme(themeName); 
        toast({
          title: "Başarılı!",
          description: `${getThemeDisplayName(themeName)} teması başarıyla uygulandı. Değişikliklerin yansıması için sayfa yenileniyor...`,
        });
        
        console.log(`[ThemeSelectorCard] İstemci tarafı: ${themeName} teması seçildi. HTML sınıfı güncelleniyor.`);
        if (typeof window !== "undefined") {
          const htmlEl = document.documentElement;
          // Önce tüm bilinen tema sınıflarını kaldır
          THEME_OPTIONS.forEach(opt => {
              if (opt !== 'default') { // 'default' bir sınıf olarak eklenmez, :root kullanılır
                  htmlEl.classList.remove(`theme-${opt}`);
              }
          });
          // htmlEl.classList.remove('dark'); // .dark sınıfını yönetmek için ayrı bir mantık olabilir, şimdilik temalar kendi karanlık/aydınlık modunu yönetiyor varsayalım.

          // Yeni tema sınıfını ekle (eğer 'default' değilse)
          if (themeName !== 'default') {
            htmlEl.classList.add(`theme-${themeName}`);
            console.log(`[ThemeSelectorCard] İstemci tarafı: 'theme-${themeName}' sınıfı <html>'e eklendi.`);
          } else {
            console.log(`[ThemeSelectorCard] İstemci tarafı: 'default' tema seçildi, özel 'theme-*' sınıfı eklenmedi.`);
          }
        }
        // Sunucudan güncel veriyi çekmek ve RootLayout'un yeniden render olmasını sağlamak için
        router.refresh(); 
        console.log("[ThemeSelectorCard] router.refresh() çağrıldı.");
      } else {
        toast({
          title: "Hata!",
          description: result.message || "Tema güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sunucu Hatası!",
        description: "Tema güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
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
              onClick={() => handleThemeSelect(themeKey)}
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
                  disabled={isSaving === themeKey || isActive}
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
