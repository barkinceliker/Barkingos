
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getThemeSetting, updateThemeSetting } from "@/lib/actions/settings-actions";
import { THEME_OPTIONS, type ThemeName } from "@/lib/theme-config";

const themeOptionsList = THEME_OPTIONS.map(theme => ({
  value: theme,
  label: theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

const themeFormSchema = z.object({
  activeTheme: z.custom<ThemeName>((val) => THEME_OPTIONS.includes(val as ThemeName), "Geçersiz tema seçimi."),
});

type ThemeFormValues = z.infer<typeof themeFormSchema>;

export default function ThemeSettingsFormCard() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      activeTheme: 'default', 
    },
  });

  useEffect(() => {
    async function fetchInitialTheme() {
      setIsLoadingInitialData(true);
      try {
        const currentThemeSetting = await getThemeSetting();
        form.reset({ activeTheme: currentThemeSetting.activeTheme });
      } catch (error) {
        toast({
          title: "Hata!",
          description: "Mevcut tema ayarları yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInitialData(false);
      }
    }
    fetchInitialTheme();
  }, [form, toast]);

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: ThemeFormValues) {
    try {
      const result = await updateThemeSetting(values.activeTheme);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        router.refresh(); 
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
        description: "Tema güncellenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }

  if (isLoadingInitialData) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
             <Palette className="mr-3 h-6 w-6" /> Site Teması
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Tema ayarları yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl text-primary flex items-center">
                <Palette className="mr-3 h-6 w-6" /> Site Teması
            </CardTitle>
            <CardDescription>
            Sitenizin genel görünümünü ve renk paletini buradan seçebilirsiniz.
            Değişiklikler tüm siteye anında yansıyacaktır.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="activeTheme"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Aktif Tema</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Bir tema seçin" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {themeOptionsList.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormDescription>
                        Sitenizin genel renk şemasını belirler.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isLoadingInitialData}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Temayı Kaydet
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
