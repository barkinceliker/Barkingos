
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Loader2, Undo, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CORE_THEME_VARIABLES, DEFAULT_CUSTOM_THEME_VALUES, type CustomThemeValues, type ThemeVariable } from '@/lib/custom-theme-variables';
import type { CustomThemeInput, CustomTheme } from '@/lib/actions/custom-theme-actions'; // CustomThemeInput action için

// Zod şemasını dinamik olarak oluştur
const variableSchemaEntries = CORE_THEME_VARIABLES.reduce((acc, variable) => {
  acc[variable.name] = z.string().min(1, `${variable.label} gereklidir.`);
  return acc;
}, {} as Record<string, z.ZodString>);

const customThemeFormSchema = z.object({
  name: z.string().min(3, "Tema ID (kısa ad) en az 3 karakter olmalıdır.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Tema ID sadece küçük harf, rakam ve tire içerebilir (boşluksuz). Örn: benim-harika-temam"),
  displayName: z.string().min(3, "Tema Görünen Adı en az 3 karakter olmalıdır."),
  ...variableSchemaEntries,
});

type CustomThemeFormValues = z.infer<typeof customThemeFormSchema>;

interface CustomThemeFormProps {
  initialData?: CustomTheme & { id: string }; // Firestore'dan gelen tam döküman (ID dahil)
  onSubmitAction: (id: string | undefined, data: CustomThemeInput) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function CustomThemeForm({ initialData, onSubmitAction, isEditing }: CustomThemeFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // initialData'dan form değerlerini oluştur
  const getDefaultValues = () => {
    if (isEditing && initialData) {
      const values: Partial<CustomThemeFormValues> = {
        name: initialData.name,
        displayName: initialData.displayName,
      };
      CORE_THEME_VARIABLES.forEach(variable => {
        values[variable.name as keyof Omit<CustomThemeFormValues, 'name' | 'displayName'>] = initialData[variable.name] as string || variable.defaultValue;
      });
      return values as CustomThemeFormValues;
    }
    // Yeni tema için varsayılanlar
    const newThemeDefaults: Partial<CustomThemeFormValues> = { name: '', displayName: '' };
    CORE_THEME_VARIABLES.forEach(variable => {
      newThemeDefaults[variable.name as keyof Omit<CustomThemeFormValues, 'name' | 'displayName'>] = variable.defaultValue;
    });
    return newThemeDefaults as CustomThemeFormValues;
  };
  
  const form = useForm<CustomThemeFormValues>({
    resolver: zodResolver(customThemeFormSchema),
    defaultValues: getDefaultValues(),
  });

  const { formState: { isSubmitting, errors } } = form;

  async function onSubmit(values: CustomThemeFormValues) {
    // Formdan gelen değerler zaten CustomThemeInput'a uygun olmalı
    const themeData: CustomThemeInput = {
      ...values,
    };

    const result = await onSubmitAction(initialData?.id, themeData);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      if (isEditing && result.id) {
        if (initialData?.name !== values.name) { // Eğer tema ID (name) değiştiyse
            router.push(`/admin/manage-settings/custom-themes/edit/${result.id}`); // Yeni ID ile edit sayfasına
        } else {
            router.refresh(); // Sayfayı yenile
        }
      } else if (result.id) { // Yeni oluşturulduysa
        router.push(`/admin/manage-settings/custom-themes/edit/${result.id}`); // Yeni oluşturulan temanın edit sayfasına git
      } else {
        router.push('/admin/manage-settings/custom-themes'); // Listeye dön
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof CustomThemeFormValues;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            form.setError(fieldName, { type: "manual", message: messages.join(', ') });
          } else if (typeof messages === 'string') {
             form.setError(fieldName, { type: "manual", message: messages });
          }
        });
      }
    }
  }

  const generateThemeIdFromName = () => {
    const displayName = form.getValues("displayName");
    if (displayName && !isEditing) { // Sadece yeni tema oluştururken ve ID boşken
        const slug = displayName
          .toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/\s+/g, '-') 
          .replace(/[^\w-]+/g, '') 
          .replace(/--+/g, '-') 
          .replace(/^-+|-+$/g, ''); 
        form.setValue("name", slug, { shouldValidate: true });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Palette className="mr-3 h-7 w-7" />
              {isEditing ? `"${initialData?.displayName || 'Tema'}" Düzenle` : "Yeni Özel Tema Oluştur"}
            </CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut özel temanın adını ve renk kodlarını güncelleyin." : "Yeni bir özel tema için aşağıdaki alanları doldurun. Renk kodlarını HSL formatında (örn: 220 10% 50%) veya geçerli CSS renk değerleri olarak girin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-380px)] pr-6"> {/* Yüksekliği ayarla */}
              <div className="space-y-6">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Görünen Adı</FormLabel>
                    <FormControl><Input {...field} placeholder="Örn: Gece Yarısı Mavisi" onBlur={generateThemeIdFromName} /></FormControl>
                    <FormDescription>Temanın listede ve seçim menüsünde görünecek adı.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema ID (Kısa Ad)</FormLabel>
                    <FormControl><Input {...field} placeholder="örn: gece-yarisi-mavisi" disabled={isEditing} /></FormControl>
                    <FormDescription>Benzersiz, slug benzeri bir kimlik. Yalnızca küçük harf, rakam ve tire içermelidir. Yeni tema oluştururken görünen addan otomatik türetilebilir. Düzenleme sırasında değiştirilemez.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <hr className="my-6 border-border" />
                <h3 className="text-lg font-medium text-primary mb-4">Renk Değişkenleri (HSL Formatı)</h3>

                {CORE_THEME_VARIABLES.map((variable) => (
                  <FormField
                    key={variable.name}
                    control={form.control}
                    name={variable.name as keyof Omit<CustomThemeFormValues, 'name' | 'displayName'>}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{variable.label} <code className="text-xs text-muted-foreground">({variable.name})</code></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={variable.defaultValue}
                            type={variable.type === 'color' ? 'text' : variable.type === 'size' ? 'text' : 'text'} // type='color' html color picker açar, şimdilik text
                          />
                        </FormControl>
                        {variable.description && <FormDescription>{variable.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <Button type="submit" className="min-w-[150px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Temayı Oluştur"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/manage-settings/custom-themes">
              <Undo className="mr-2 h-4 w-4" /> İptal ve Listeye Dön
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
