
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Undo, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import type { NavItemInput } from '@/lib/actions/navigation-actions';
import Link from "next/link";

const navItemFormSchema = z.object({
  label: z.string().min(1, "Etiket gereklidir."),
  href: z.string().min(1, "Bağlantı (href) gereklidir. Örn: /hakkimda veya /#hakkimda-section"),
  iconName: z.string().optional().describe("Lucide ikon adı. Örn: Home, User. Boş bırakılabilir."),
  order: z.coerce.number().min(0, "Sıra pozitif bir sayı olmalıdır.").default(0),
  target: z.enum(['_self', '_blank']).optional().default('_self'),
});

type NavItemFormValues = z.infer<typeof navItemFormSchema>;

interface NavItemFormProps {
  initialData?: NavItemInput; // Firestore document ID will be part of NavItemInput if fetched
  onSubmitAction: (data: Omit<NavItemInput, 'id'>, id?: string) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function NavItemForm({ initialData, onSubmitAction, isEditing }: NavItemFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NavItemFormValues>({
    resolver: zodResolver(navItemFormSchema),
    defaultValues: {
      label: initialData?.label || "",
      href: initialData?.href || "",
      iconName: initialData?.iconName || "",
      order: initialData?.order || 0,
      target: initialData?.target || "_self",
    },
  });

  const { formState: { isSubmitting } } = form;
  
  async function onSubmit(values: NavItemFormValues) {
    const navData: Omit<NavItemInput, 'id'> = {
      label: values.label,
      href: values.href,
      iconName: values.iconName || undefined, // Ensure empty string becomes undefined
      order: values.order,
      target: values.target,
    };

    const result = await onSubmitAction(navData, initialData?.id);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      // Admin ana sayfasına yönlendir, çünkü liste orada
      router.push('/admin');
      router.refresh(); // To reflect changes in the accordion on the admin page
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof NavItemFormValues;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            form.setError(fieldName, { type: "manual", message: messages.join(', ') });
          } else if (typeof messages === 'string') {
             form.setError(fieldName, { type: "manual", message: messages });
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <ListChecks className="mr-3 h-7 w-7" />
                {isEditing ? "Navigasyon Öğesini Düzenle" : "Yeni Navigasyon Öğesi Oluştur"}
            </CardTitle>
            <CardDescription>
              {isEditing ? `"${initialData?.label}" adlı navigasyon öğesinin detaylarını güncelleyin.` : "Site navigasyonu için yeni bir öğe ekleyin."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="label" render={({ field }) => (
              <FormItem>
                <FormLabel>Etiket</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: Anasayfa, Hakkımda" /></FormControl>
                <FormDescription>Menüde görünecek metin.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="href" render={({ field }) => (
              <FormItem>
                <FormLabel>Bağlantı (href)</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: /blog veya /#iletisim-section" /></FormControl>
                <FormDescription>Tam yol (örn: /projeler) veya sayfa içi bölüm ID'si (örn: /#hizmetler-section).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="iconName" render={({ field }) => (
              <FormItem>
                <FormLabel>İkon Adı (Opsiyonel)</FormLabel>
                <FormControl><Input {...field} placeholder="Örn: Home, UserCircle, Settings" /></FormControl>
                <FormDescription>
                  <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Lucide ikonları</a> listesinden bir ikon adı. Örn: 'Home', 'User'.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem>
                <FormLabel>Sıra Numarası</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormDescription>Öğelerin menüde gösterilme sırası (küçükten büyüğe).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="target" render={({ field }) => (
                <FormItem>
                    <FormLabel>Bağlantı Hedefi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Hedef seçin" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="_self">Aynı Sekmede Aç (_self)</SelectItem>
                        <SelectItem value="_blank">Yeni Sekmede Aç (_blank)</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormDescription>Bağlantının nasıl açılacağını belirler.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
            
          </CardContent>
        </Card>

        <div className="flex justify-center items-center gap-4 max-w-2xl mx-auto">
          <Button type="submit" className="min-w-[150px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Öğeyi Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin"> {/* Admin ana sayfasına dön */}
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
