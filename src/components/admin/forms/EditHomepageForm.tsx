
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
            <CardTitle className="font-headline text-xl text-gradient">Hero Alanı</CardTitle>
            <CardDescription>Sitenizin ana karşılama bölümünün başlıklarını buradan düzenleyebilirsiniz.</CardDescription>
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Değişiklikleri Kaydet
        </Button>
      </form>
    </Form>
  );
}
