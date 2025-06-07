"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { improveBlogPostSeo, ImproveBlogPostSeoOutput } from "@/ai/flows/improve-blog-post-seo";
import { suggestBlogPostCategories, SuggestBlogPostCategoriesOutput } from "@/ai/flows/suggest-blog-post-categories";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Tags } from "lucide-react";

const formSchema = z.object({
  blogPostContent: z.string().min(50, "Blog içeriği en az 50 karakter olmalıdır."),
  targetKeywords: z.string().min(3, "Hedef anahtar kelimeler en az 3 karakter olmalıdır."),
  currentCategory: z.string().min(2, "Mevcut kategori en az 2 karakter olmalıdır."),
});

export default function BlogAssistantPage() {
  const { toast } = useToast();
  const [isLoadingSeo, setIsLoadingSeo] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [seoResult, setSeoResult] = useState<ImproveBlogPostSeoOutput | null>(null);
  const [categoryResult, setCategoryResult] = useState<SuggestBlogPostCategoriesOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blogPostContent: "",
      targetKeywords: "",
      currentCategory: "",
    },
  });

  async function onImproveSeo(values: z.infer<typeof formSchema>) {
    setIsLoadingSeo(true);
    setSeoResult(null);
    try {
      const result = await improveBlogPostSeo({
        blogPostContent: values.blogPostContent,
        targetKeywords: values.targetKeywords,
        currentCategory: values.currentCategory,
      });
      setSeoResult(result);
      toast({
        title: "SEO İyileştirmesi Başarılı!",
        description: "Blog yazınız için iyileştirmeler ve SEO puanı oluşturuldu.",
      });
    } catch (error) {
      console.error("SEO iyileştirme hatası:", error);
      toast({
        title: "Hata!",
        description: "SEO iyileştirme sırasında bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSeo(false);
    }
  }
  
  async function onSuggestCategories(values: z.infer<typeof formSchema>) {
    setIsLoadingCategories(true);
    setCategoryResult(null);
    try {
      const result = await suggestBlogPostCategories({
        blogPostContent: values.blogPostContent,
      });
      setCategoryResult(result);
      toast({
        title: "Kategori Önerileri Başarılı!",
        description: "Blog yazınız için kategori önerileri oluşturuldu.",
      });
    } catch (error) {
      console.error("Kategori önerme hatası:", error);
      toast({
        title: "Hata!",
        description: "Kategori önerileri oluşturulurken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">AI Blog Asistanı</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Blog yazılarınızı geliştirmek, SEO performansını artırmak ve uygun kategoriler bulmak için yapay zeka destekli aracımızı kullanın.
        </p>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Blog Yazısı Bilgileri</CardTitle>
          <CardDescription>Lütfen aşağıdaki alanları doldurarak blog yazınızı analiz ettirin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="blogPostContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Yazısı İçeriği</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Blog yazınızın tamamını buraya yapıştırın..." {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hedef Anahtar Kelimeler (virgülle ayırın)</FormLabel>
                      <FormControl>
                        <Input placeholder="örn: web geliştirme, react, seo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mevcut Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder="örn: Teknoloji" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="button" onClick={form.handleSubmit(onImproveSeo)} className="w-full sm:w-auto" disabled={isLoadingSeo || isLoadingCategories}>
                  {isLoadingSeo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  SEO ve İçeriği İyileştir
                </Button>
                 <Button type="button" onClick={form.handleSubmit(onSuggestCategories)} className="w-full sm:w-auto" variant="outline" disabled={isLoadingCategories || isLoadingSeo}>
                  {isLoadingCategories ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                  Kategori Öner
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {seoResult && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">SEO İyileştirme Sonuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">SEO Puanı:</h3>
              <Badge variant={seoResult.seoScore > 70 ? "default" : "secondary"} className={seoResult.seoScore > 70 ? "bg-green-500 hover:bg-green-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"}>
                {seoResult.seoScore} / 100
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Önerilen Kategoriler:</h3>
              <div className="flex flex-wrap gap-2">
                {seoResult.suggestedCategories.map((cat, index) => (
                  <Badge key={index} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">İyileştirilmiş İçerik:</h3>
              <Textarea readOnly value={seoResult.improvedContent} rows={15} className="bg-muted" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {categoryResult && !seoResult && ( // Show only if SEO result is not present to avoid redundancy
         <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Kategori Öneri Sonuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Önerilen Kategoriler:</h3>
              <div className="flex flex-wrap gap-2">
                {categoryResult.categories.map((cat, index) => (
                  <Badge key={index} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
