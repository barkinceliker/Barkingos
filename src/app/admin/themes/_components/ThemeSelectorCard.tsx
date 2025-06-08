
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

// Helper to generate a display name from a theme key
const getThemeDisplayName = (themeKey: ThemeName): string => {
  if (themeKey === 'default') return 'Varsayılan (Açık)';
  return themeKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper to get preview colors (approximations)
const getThemePreviewColors = (themeKey: ThemeName): { primary: string; accent: string; background: string } => {
  // These are rough HSL string approximations for preview.
  // For precise previews, you'd need to parse globals.css or have a JS mapping.
  switch (themeKey) {
    case 'default': return { primary: 'hsl(231 48% 48%)', accent: 'hsl(174 100% 29%)', background: 'hsl(220 17% 95%)' };
    case 'ocean-depth': return { primary: 'hsl(180 65% 55%)', accent: 'hsl(30 85% 60%)', background: 'hsl(205 50% 12%)' };
    case 'cyber-punk': return { primary: 'hsl(180 100% 50%)', accent: 'hsl(60 100% 55%)', background: 'hsl(270 70% 7%)' };
    case 'midnight-gradient': return { primary: 'hsl(280 80% 65%)', accent: 'hsl(180 90% 50%)', background: 'hsl(240 10% 4%)' };
    case 'forest-green': return { primary: 'hsl(130 55% 45%)', accent: 'hsl(90 60% 50%)', background: 'hsl(120 20% 96%)' };
    case 'deep-navy': return { primary: 'hsl(200 80% 60%)', accent: 'hsl(250 70% 65%)', background: 'hsl(220 40% 10%)' };
    case 'blush-pink': return { primary: 'hsl(330 70% 55%)', accent: 'hsl(300 70% 60%)', background: 'hsl(340 80% 97%)' };
    case 'royal-purple': return { primary: 'hsl(280 70% 60%)', accent: 'hsl(310 80% 65%)', background: 'hsl(270 50% 15%)' };
    case 'burnt-orange': return { primary: 'hsl(20 85% 55%)', accent: 'hsl(40 90% 60%)', background: 'hsl(30 60% 95%)' };
    case 'crimson-red': return { primary: 'hsl(0 70% 50%)', accent: 'hsl(30 80% 60%)', background: 'hsl(0 0% 12%)' };
    default: return { primary: 'hsl(0 0% 50%)', accent: 'hsl(0 0% 60%)', background: 'hsl(0 0% 90%)' };
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
        toast({
          title: "Başarılı!",
          description: `${getThemeDisplayName(themeName)} teması başarıyla uygulandı.`,
        });
        setCurrentTheme(themeName);
        // Applying theme class to html for instant preview without full reload,
        // but layout.tsx will handle it on next full navigation.
        if (typeof window !== "undefined") {
          document.documentElement.className = ''; // Clear existing theme classes
          THEME_OPTIONS.forEach(opt => {
            document.documentElement.classList.remove(`theme-${opt}`);
          });
          if (themeName !== 'default') {
            document.documentElement.classList.add(`theme-${themeName}`);
          }
        }
        router.refresh(); // Re-fetches data and re-renders Server Components
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
