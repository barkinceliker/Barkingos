
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ExperienceInput } from '@/lib/actions/experience-actions';
import Link from "next/link";

const experienceFormSchema = z.object({
  company: z.string().min(1, "Şirket adı gereklidir."),
  role: z.string().min(1, "Pozisyon gereklidir."),
  dates: z.string().min(1, "Tarih aralığı gereklidir. Örn: Ocak 2020 - Mart 2022"),
  location: z.string().min(1, "Lokasyon gereklidir. Örn: İstanbul, Türkiye"),
  descriptionString: z.string().min(1, "Açıklamalar gereklidir (her bir madde yeni satırda)."),
  logoUrl: z.string().url("Geçerli bir logo URL'si giriniz.").or(z.literal('')).optional(),
  dataAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

interface ExperienceFormProps {
  initialData?: ExperienceInput; 
  onSubmitAction: (data: Omit<ExperienceInput, 'id'>, id?: string) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function ExperienceForm({ initialData, onSubmitAction, isEditing }: ExperienceFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: initialData?.company || "",
      role: initialData?.role || "",
      dates: initialData?.dates || "",
      location: initialData?.location || "",
      descriptionString: initialData?.description?.join("\n") || "",
      logoUrl: initialData?.logoUrl || "",
      dataAiHint: initialData?.dataAiHint || "",
    },
  });

  const { formState: { isSubmitting } } = form;
  
  async function onSubmit(values: ExperienceFormValues) {
    const descriptionArray = values.descriptionString.split('\n').map(desc => desc.trim()).filter(desc => desc.length > 0);
    
    const experienceData: Omit<ExperienceInput, 'id'> = {
      company: values.company,
      role: values.role,
      dates: values.dates,
      location: values.location,
      description: descriptionArray,
      logoUrl: values.logoUrl,
      dataAiHint: values.dataAiHint,
    };

    const result = await onSubmitAction(experienceData, initialData?.id);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      if (isEditing && result.id) {
        router.refresh(); 
      } else if (result.id) { 
        router.push(`/admin/manage-experiences/edit/${result.id}`);
      } else { 
        router.push('/admin/manage-experiences');
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof ExperienceFormValues;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            form.setError(fieldName, { type: "manual", message: messages.join(', ') });
          } else if (typeof messages === 'string') {
             form.setError(fieldName, { type: "manual", message: messages as string });
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-gradient">{isEditing ? "Deneyimi Düzenle" : "Yeni Deneyim Oluştur"}</CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut deneyimin detaylarını güncelleyin." : "Yeni bir deneyim için aşağıdaki alanları doldurun."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Şirket Adı</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: Teknoloji Çözümleri A.Ş." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Pozisyon / Rol</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: Kıdemli Yazılım Geliştirici" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dates" render={({ field }) => (
              <FormItem>
                <FormLabel>Tarih Aralığı</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: Ocak 2021 - Günümüz" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasyon</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: İstanbul, Türkiye" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="descriptionString" render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklamalar</FormLabel>
                <FormControl><Textarea {...field} rows={5} placeholder="Her bir maddeyi yeni bir satıra yazın." /></FormControl>
                <FormDescription>Deneyimle ilgili önemli noktaları veya sorumlulukları her biri yeni satırda olacak şekilde girin.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="logoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Şirket Logo URL'si (Opsiyonel)</FormLabel>
                <FormControl><Input {...field} placeholder="https://ornek.com/logo.png" /></FormControl>
                <FormDescription>Boş bırakırsanız, şirket adının ilk 3 harfi ile bir placeholder oluşturulur.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dataAiHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Logo AI İpucu (data-ai-hint) (Opsiyonel)</FormLabel>
                <FormControl><Input {...field} placeholder="company logo" /></FormControl>
                <FormDescription>Logo resmi için 1-2 anahtar kelime (boşlukla ayrılmış).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Deneyimi Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin/manage-experiences">
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
