
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateSiteGeneralSettings, type SiteGeneralSettings } from "@/lib/actions/settings-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const siteGeneralSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site başlığı gereklidir."),
  siteDescription: z.string().optional(),
  // Add other general settings here if needed in the future
});

type SiteGeneralSettingsFormValues = z.infer<typeof siteGeneralSettingsSchema>;

interface SiteGeneralSettingsFormProps {
  initialData: SiteGeneralSettings;
}

export default function SiteGeneralSettingsForm({ initialData }: SiteGeneralSettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SiteGeneralSettingsFormValues>({
    resolver: zodResolver(siteGeneralSettingsSchema),
    defaultValues: {
      siteTitle: initialData?.siteTitle || "BenimSitem",
      siteDescription: initialData?.siteDescription || "Kişisel portfolyo ve blog sitem.",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: SiteGeneralSettingsFormValues) {
    try {
      const result = await updateSiteGeneralSettings(values);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        router.refresh(); // Revalidate the layout to reflect new title/description
      } else {
        toast({
          title: "Hata!",
          description: result.message || "Ayarlar güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            const fieldName = field as keyof SiteGeneralSettingsFormValues;
            const message = Array.isArray(messages) ? messages.join(', ') : typeof messages === 'string' ? messages : 'Bilinmeyen hata';
            form.setError(fieldName, { type: "manual", message });
          });
        }
      }
    } catch (error) {
      toast({
        title: "Sunucu Hatası!",
        description: "Ayarlar güncellenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
             <CardTitle className="font-headline text-xl text-primary flex items-center">
                <Settings className="mr-3 h-6 w-6" /> Genel Site Ayarları
            </CardTitle>
            <CardDescription>
              Sitenizin genel başlığını ve meta açıklamasını buradan yönetebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="siteTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Site Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormDescription>Tarayıcı sekmesinde ve arama sonuçlarında görünecek ana başlık.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="siteDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Site Açıklaması (Meta Description)</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormDescription>Arama motorları için sitenizin kısa bir özeti (genellikle 150-160 karakter).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Ayarları Kaydet
        </Button>
      </form>
    </Form>
  );
}
