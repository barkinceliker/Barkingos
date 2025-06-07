
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import type { BlogPostInput } from '@/lib/actions/blog-actions'; // Tip tanımını al
import Link from "next/link";

const blogPostFormSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir."),
  slug: z.string().min(1, "Slug gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug sadece küçük harf, rakam ve tire içerebilir. Örn: benim-yeni-yazim"),
  date: z.string().min(1, "Tarih gereklidir."), // Veya date-fns ile formatlanmış bir tarih
  category: z.string().min(1, "Kategori gereklidir."),
  tags: z.string().min(1, "Etiketler gereklidir (virgülle ayrılmış)."), // String olarak alıp, submit'te array'e çevireceğiz
  imageUrl: z.string().url("Geçerli bir resim URL'si giriniz.").or(z.literal('')).optional(),
  summary: z.string().optional(),
  content: z.string().min(1, "İçerik gereklidir."),
  dataAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

interface BlogPostFormProps {
  initialData?: BlogPostInput & { id: string }; // id, Firestore'dan gelen slug ile aynı olacak
  onSubmitAction: (data: BlogPostInput) => Promise<{ success: boolean; message: string; slug?: string; errors?: any }>;
  isEditing: boolean;
}

export default function BlogPostForm({ initialData, onSubmitAction, isEditing }: BlogPostFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      date: initialData?.date || new Date().toISOString().split('T')[0], // YYYY-MM-DD formatında
      category: initialData?.category || "",
      tags: initialData?.tags?.join(", ") || "", // Array'i string'e çevir
      imageUrl: initialData?.imageUrl || "",
      summary: initialData?.summary || "",
      content: initialData?.content || "",
      dataAiHint: initialData?.dataAiHint || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: BlogPostFormValues) {
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const postData: BlogPostInput = {
      ...values,
      tags: tagsArray,
      imageUrl: values.imageUrl || 'https://placehold.co/1200x600.png', // Default placeholder
    };

    const result = await onSubmitAction(postData);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      // Düzenleme ise aynı sayfada kal, yeni ise oluşturulan yazıya veya listeye git
      if (isEditing && result.slug) {
         if (initialData?.slug !== result.slug) { // Slug değiştiyse
            router.push(`/admin/manage-blog/edit/${result.slug}`);
         } else {
            router.refresh(); // Sayfayı yenile, veriler güncellensin
         }
      } else if (result.slug) {
        router.push(`/admin/manage-blog/edit/${result.slug}`);
      } else {
        router.push('/admin/manage-blog');
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          if (messages && Array.isArray(messages) && messages.length > 0) {
            form.setError(field as keyof BlogPostFormValues, { type: "manual", message: messages.join(', ') });
          } else if (typeof messages === 'string') {
             form.setError(field as keyof BlogPostFormValues, { type: "manual", message: messages as string });
          }
        });
      }
    }
  }

  const generateSlug = () => {
    const title = form.getValues("title");
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-') // boşlukları tire ile değiştir
      .replace(/[^\w-]+/g, '') // alfanumerik olmayan karakterleri kaldır (tireler hariç)
      .replace(/--+/g, '-') // birden fazla tireyi tek tire yap
      .replace(/^-+|-+$/g, ''); // baştaki ve sondaki tireleri kaldır
    form.setValue("slug", slug, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{isEditing ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Oluştur"}</CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut blog yazısının detaylarını güncelleyin." : "Yeni bir blog yazısı için aşağıdaki alanları doldurun."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL Dostu Adres)</FormLabel>
                 <div className="flex items-center gap-2">
                    <FormControl><Input {...field} placeholder="ornek-yazi-slug" /></FormControl>
                    <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Oluştur</Button>
                </div>
                <FormDescription>Başlıktan otomatik oluşturabilir veya manuel girebilirsiniz. Sadece küçük harf, rakam ve tire içermelidir.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Yayın Tarihi</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Etiketler</FormLabel>
                <FormControl><Input {...field} placeholder="web, teknoloji, tasarım" /></FormControl>
                <FormDescription>Etiketleri virgülle ayırarak girin.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Öne Çıkan Resim URL'si</FormLabel>
                <FormControl><Input {...field} placeholder="https://ornek.com/resim.jpg" /></FormControl>
                 <FormDescription>Boş bırakırsanız varsayılan placeholder kullanılır.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="dataAiHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Resim AI İpucu (data-ai-hint)</FormLabel>
                <FormControl><Input {...field} placeholder="technology abstract" /></FormControl>
                <FormDescription>Resim için 1-2 anahtar kelime.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem>
                <FormLabel>Özet (Opsiyonel)</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>İçerik (HTML)</FormLabel>
                <FormControl><Textarea {...field} rows={15} /></FormControl>
                <FormDescription>Yazının ana içeriği. HTML etiketleri kullanabilirsiniz.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Yazıyı Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin/manage-blog">
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
