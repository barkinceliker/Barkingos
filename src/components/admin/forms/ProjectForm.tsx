
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProjectInput } from '@/lib/actions/project-actions';
import Link from "next/link";

const projectFormSchema = z.object({
  id: z.string().min(1, "Proje ID (slug) gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID sadece küçük harf, rakam ve tire içerebilir. Örn: benim-projem"),
  title: z.string().min(1, "Başlık gereklidir."),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Kısa açıklama gereklidir."),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Geçerli bir resim URL'si giriniz.").or(z.literal('')).optional(),
  status: z.enum(['Tamamlandı', 'Devam Ediyor', 'Planlanıyor'], { required_error: "Durum seçimi gereklidir."}),
  technologies: z.string().min(1, "Teknolojiler gereklidir (virgülle ayrılmış)."),
  liveDemoUrl: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal('')),
  sourceCodeUrl: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal('')),
  dataAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: ProjectInput; 
  onSubmitAction: (id: string, data: ProjectInput) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function ProjectForm({ initialData, onSubmitAction, isEditing }: ProjectFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      id: initialData?.id || "",
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      description: initialData?.description || "",
      longDescription: initialData?.longDescription || "",
      imageUrl: initialData?.imageUrl || "https://placehold.co/800x500.png",
      status: initialData?.status || undefined, 
      technologies: initialData?.technologies?.join(", ") || "",
      liveDemoUrl: initialData?.liveDemoUrl || "",
      sourceCodeUrl: initialData?.sourceCodeUrl || "",
      dataAiHint: initialData?.dataAiHint || "",
    },
  });

  const { formState: { isSubmitting, errors } } = form;
  
  async function onSubmit(values: ProjectFormValues) {
    const technologiesArray = values.technologies.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const projectData: ProjectInput = {
      ...values,
      id: values.id, 
      technologies: technologiesArray,
      imageUrl: values.imageUrl || 'https://placehold.co/800x500.png',
    };

    const submissionId = isEditing && initialData?.id ? initialData.id : values.id;
    const result = await onSubmitAction(submissionId, projectData);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      if (isEditing && result.id) {
         if (initialData?.id !== result.id) { 
            router.push(`/admin/manage-projects/edit/${result.id}`);
         } else {
            router.refresh(); 
         }
      } else if (result.id) {
        router.push(`/admin/manage-projects/edit/${result.id}`);
      } else {
        router.push('/admin/manage-projects');
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof ProjectFormValues;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            form.setError(fieldName, { type: "manual", message: messages.join(', ') });
          } else if (typeof messages === 'string') {
             form.setError(fieldName, { type: "manual", message: messages as string });
          }
        });
      }
    }
  }
  
  const generateSlugFromTitle = () => {
    const title = form.getValues("title");
    if (title && !form.getValues("id") && !isEditing) { 
        const slug = title
          .toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/\s+/g, '-') 
          .replace(/[^\w-]+/g, '') 
          .replace(/--+/g, '-') 
          .replace(/^-+|-+$/g, ''); 
        form.setValue("id", slug, { shouldValidate: true });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-gradient">{isEditing ? "Projeyi Düzenle" : "Yeni Proje Oluştur"}</CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut projenin detaylarını güncelleyin." : "Yeni bir proje için aşağıdaki alanları doldurun."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
                <FormControl><Input {...field} onBlur={generateSlugFromTitle} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="id" render={({ field }) => (
              <FormItem>
                <FormLabel>Proje ID (Slug)</FormLabel>
                <FormControl><Input {...field} placeholder="ornek-proje-slug" disabled={isEditing} /></FormControl>
                <FormDescription>URL için benzersiz kimlik. Düzenleme sırasında değiştirilemez. Başlıktan otomatik oluşturulabilir (yeni eklerken).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="subtitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Alt Başlık (Opsiyonel)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Kısa Açıklama</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="longDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Uzun Açıklama (Opsiyonel)</FormLabel>
                <FormControl><Textarea {...field} rows={6} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Resim URL'si</FormLabel>
                <FormControl><Input {...field} placeholder="https://ornek.com/resim.jpg" /></FormControl>
                 <FormDescription>Boş bırakırsanız varsayılan placeholder kullanılır.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

             <FormField control={form.control} name="dataAiHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Resim AI İpucu (data-ai-hint)</FormLabel>
                <FormControl><Input {...field} placeholder="technology project" /></FormControl>
                <FormDescription>Resim için 1-2 anahtar kelime.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Durum</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Proje durumunu seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                    <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                    <SelectItem value="Planlanıyor">Planlanıyor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="technologies" render={({ field }) => (
              <FormItem>
                <FormLabel>Kullanılan Teknolojiler</FormLabel>
                <FormControl><Input {...field} placeholder="React, Next.js, Tailwind CSS" /></FormControl>
                <FormDescription>Teknolojileri virgülle ayırarak girin.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="liveDemoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Canlı Demo URL'si (Opsiyonel)</FormLabel>
                <FormControl><Input type="url" {...field} placeholder="https://demo.proje.com" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="sourceCodeUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Kaynak Kodu URL'si (Opsiyonel)</FormLabel>
                <FormControl><Input type="url" {...field} placeholder="https://github.com/kullanici/proje" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Projeyi Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin/manage-projects">
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
    
