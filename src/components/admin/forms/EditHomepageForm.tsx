
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HomepageContent, updateHomepageContent } from "@/lib/actions/page-content-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const homepageContentSchema = z.object({
  heroTitle: z.string().min(1, "Hero başlığı gereklidir."),
  heroSubtitle: z.string().min(1, "Hero alt başlığı gereklidir."),
  aboutSnippetTitle: z.string().min(1, "'Kısaca Ben' bölüm başlığı gereklidir."),
  aboutSnippetDescription: z.string().min(1, "'Kısaca Ben' bölüm açıklaması gereklidir."),
  recentProjectsTitle: z.string().min(1, "'Son Projelerim' bölüm başlığı gereklidir."),
  recentBlogPostsTitle: z.string().min(1, "'Son Blog Yazıları' bölüm başlığı gereklidir."),
});

type EditHomepageFormValues = z.infer<typeof homepageContentSchema>;

interface EditHomepageFormProps {
  initialData: HomepageContent;
}

export default function EditHomepageForm({ initialData }: EditHomepageFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditHomepageFormValues>({
    resolver: zodResolver(homepageContentSchema),
    defaultValues: {
      heroTitle: initialData.heroTitle || "",
      heroSubtitle: initialData.heroSubtitle || "",
      aboutSnippetTitle: initialData.aboutSnippetTitle || "",
      aboutSnippetDescription: initialData.aboutSnippetDescription || "",
      recentProjectsTitle: initialData.recentProjectsTitle || "",
      recentBlogPostsTitle: initialData.recentBlogPostsTitle || "",
    },
  });

  const {formState: {isSubmitting}} = form;

  async function onSubmit(values: EditHomepageFormValues) {
    try {
      const result = await updateHomepageContent(values);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        router.refresh(); 
      } else {
        toast({
          title: "Hata!",
          description: result.message || "İçerik güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            const fieldName = field as keyof EditHomepageFormValues;
            const message = Array.isArray(messages) ? messages.join(', ') : typeof messages === 'string' ? messages : 'Bilinmeyen hata';
            form.setError(fieldName, { type: "manual", message });
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
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Hero Alanı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="heroTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Ana Başlık (Hero)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Alt Başlık (Hero)</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">"Kısaca Ben" Alanı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="aboutSnippetTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Bölüm Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="aboutSnippetDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Bölüm Açıklaması</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Diğer Bölüm Başlıkları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="recentProjectsTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>"Son Projelerim" Bölüm Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="recentBlogPostsTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>"Son Blog Yazıları" Bölüm Başlığı</FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
