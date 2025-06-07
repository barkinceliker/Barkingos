
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
import { HakkimdaPageContent, updateHakkimdaContent } from "@/lib/actions/page-content-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  pageTitle: z.string().min(1, "Sayfa başlığı gereklidir."),
  pageSubtitle: z.string().min(1, "Sayfa alt başlığı gereklidir."),
  profileImageUrl: z.string().url("Geçerli bir profil resmi URL'si giriniz.").or(z.literal('')).or(z.string().optional()),
  profileImageAiHint: z.string().max(50, "AI hint en fazla 50 karakter olabilir.").optional(),
  whoAmI_p1: z.string().min(1, "Ben kimim? ilk paragraf gereklidir."),
  whoAmI_p2: z.string().optional(),
  whoAmI_p3_hobbies: z.string().optional(),
  stat_experience_value: z.string().min(1, "Deneyim süresi gereklidir."),
  stat_expertise_value: z.string().min(1, "Uzmanlık alanları gereklidir."),
  stat_teamwork_value: z.string().min(1, "Takım çalışması açıklaması gereklidir."),
  mission_title: z.string().min(1, "Misyon başlığı gereklidir."),
  mission_p1: z.string().min(1, "Misyon paragrafı gereklidir."),
});

type EditHakkimdaPageFormValues = z.infer<typeof formSchema>;

interface EditHakkimdaPageFormProps {
  initialData: HakkimdaPageContent;
}

export default function EditHakkimdaPageForm({ initialData }: EditHakkimdaPageFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditHakkimdaPageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageTitle: initialData.pageTitle || '',
      pageSubtitle: initialData.pageSubtitle || '',
      profileImageUrl: initialData.profileImageUrl || '',
      profileImageAiHint: initialData.profileImageAiHint || '',
      whoAmI_p1: initialData.whoAmI_p1 || '',
      whoAmI_p2: initialData.whoAmI_p2 || '',
      whoAmI_p3_hobbies: initialData.whoAmI_p3_hobbies || '',
      stat_experience_value: initialData.stat_experience_value || '',
      stat_expertise_value: initialData.stat_expertise_value || '',
      stat_teamwork_value: initialData.stat_teamwork_value || '',
      mission_title: initialData.mission_title || '',
      mission_p1: initialData.mission_p1 || '',
    },
  });

  const {formState: {isSubmitting}} = form;

  async function onSubmit(values: EditHakkimdaPageFormValues) {
    try {
      const result = await updateHakkimdaContent(values as HakkimdaPageContent);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        router.refresh(); // Refresh server components to reflect changes
      } else {
        toast({
          title: "Hata!",
          description: result.message || "İçerik güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof EditHakkimdaPageFormValues, { type: "manual", message: messages.join(', ') });
            }
          });
        }
      }
    } catch (error) {
      toast({
        title: "Sunucu Hatası!",
        description: "İçerik güncellenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">Genel Sayfa Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="pageTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Sayfa Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="pageSubtitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Sayfa Alt Başlığı</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">Profil Bölümü</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="profileImageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Profil Resmi URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://placehold.co/400x400.png" /></FormControl>
                <FormDescription>Tam bir URL girin (örn: https://...). Boş bırakırsanız, varsayılan placeholder kullanılabilir.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="profileImageAiHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Profil Resmi AI İpucu (data-ai-hint)</FormLabel>
                <FormControl><Input {...field} placeholder="professional portrait" /></FormControl>
                <FormDescription>Resim için 1-2 anahtar kelime (boşlukla ayrılmış).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="whoAmI_p1" render={({ field }) => (
              <FormItem>
                <FormLabel>"Ben Kimim?" Paragraf 1</FormLabel>
                <FormControl><Textarea {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="whoAmI_p2" render={({ field }) => (
              <FormItem>
                <FormLabel>"Ben Kimim?" Paragraf 2 (Opsiyonel)</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="whoAmI_p3_hobbies" render={({ field }) => (
              <FormItem>
                <FormLabel>"Ben Kimim?" Paragraf 3 - Hobiler (Opsiyonel)</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">İstatistik Kartları</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="stat_experience_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Deneyim Kartı Değeri</FormLabel>
                <FormControl><Input {...field} placeholder="[X]+ Yıl Sektör Deneyimi" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stat_expertise_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Uzmanlık Kartı Değeri</FormLabel>
                <FormControl><Input {...field} placeholder="Web Geliştirme, UI/UX Tasarımı" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stat_teamwork_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Takım Çalışması Kartı Değeri</FormLabel>
                <FormControl><Input {...field} placeholder="İşbirlikçi ve Çevik..." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-primary">Misyon Bölümü</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="mission_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Misyon Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="mission_p1" render={({ field }) => (
              <FormItem>
                <FormLabel>Misyon Paragrafı</FormLabel>
                <FormControl><Textarea {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Değişiklikleri Kaydet
        </Button>
      </form>
    </Form>
  );
}

