
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
import type { ServiceInput } from '@/lib/actions/service-actions';
import Link from "next/link";

const serviceFormSchema = z.object({
  id: z.string().min(1, "Hizmet ID (slug) gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID sadece küçük harf, rakam ve tire içerebilir."),
  title: z.string().min(1, "Başlık gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  iconName: z.string().min(1, "Lucide ikon adı gereklidir (örn: Code, Palette)."),
  detailsString: z.string().min(1, "Detaylar gereklidir (her bir detay yeni satırda)."),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData?: ServiceInput;
  onSubmitAction: (id: string, data: Omit<ServiceInput, 'id'>) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function ServiceForm({ initialData, onSubmitAction, isEditing }: ServiceFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      id: initialData?.id || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      iconName: initialData?.iconName || "Settings",
      detailsString: initialData?.details?.join("\n") || "",
    },
  });

  const { formState: { isSubmitting } } = form;
  
  async function onSubmit(values: ServiceFormValues) {
    const detailsArray = values.detailsString.split('\n').map(detail => detail.trim()).filter(detail => detail.length > 0);
    
    const serviceData: Omit<ServiceInput, 'id'> = {
      title: values.title,
      description: values.description,
      iconName: values.iconName,
      details: detailsArray,
    };

    const submissionId = isEditing && initialData?.id ? initialData.id : values.id;
    const result = await onSubmitAction(submissionId, serviceData);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      if (isEditing && result.id) {
         if (initialData?.id !== result.id) { 
            router.push(`/admin/manage-services/edit/${result.id}`);
         } else {
            router.refresh(); 
         }
      } else if (result.id) {
        router.push(`/admin/manage-services/edit/${result.id}`);
      } else {
        router.push('/admin/manage-services');
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof ServiceFormValues;
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
            <CardTitle className="font-headline text-xl text-gradient">{isEditing ? "Hizmeti Düzenle" : "Yeni Hizmet Oluştur"}</CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut hizmetin detaylarını güncelleyin." : "Yeni bir hizmet için aşağıdaki alanları doldurun."}
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
                <FormLabel>Hizmet ID (Slug)</FormLabel>
                <FormControl><Input {...field} placeholder="ornek-hizmet-slug" disabled={isEditing} /></FormControl>
                <FormDescription>URL için benzersiz kimlik. Düzenleme sırasında değiştirilemez. Başlıktan otomatik oluşturulabilir (yeni eklerken).</FormDescription>
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
            
            <FormField control={form.control} name="iconName" render={({ field }) => (
              <FormItem>
                <FormLabel>Lucide İkon Adı</FormLabel>
                <FormControl><Input {...field} placeholder="örn: Code, Palette, Users" /></FormControl>
                <FormDescription><a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Lucide ikonları listesine bakın</a>. (Örn: 'Cpu', 'Server', 'Paintbrush')</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="detailsString" render={({ field }) => (
              <FormItem>
                <FormLabel>Detaylar</FormLabel>
                <FormControl><Textarea {...field} rows={6} placeholder="Her bir detayı yeni bir satıra yazın." /></FormControl>
                <FormDescription>Hizmetin alt maddelerini/detaylarını her biri yeni satırda olacak şekilde girin.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Hizmeti Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin/manage-services">
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
