
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SkillInput } from '@/lib/actions/skill-actions';
import Link from "next/link";

const skillFormSchema = z.object({
  name: z.string().min(1, "Yetenek adı gereklidir."),
  proficiency: z.number().min(0).max(100),
  category: z.string().min(1, "Kategori gereklidir."),
  iconName: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

interface SkillFormProps {
  initialData?: SkillInput; // Firestore document ID will be part of SkillInput if fetched
  onSubmitAction: (data: Omit<SkillInput, 'id'>, id?: string) => Promise<{ success: boolean; message: string; id?: string; errors?: any }>;
  isEditing: boolean;
}

export default function SkillForm({ initialData, onSubmitAction, isEditing }: SkillFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      proficiency: initialData?.proficiency || 75,
      category: initialData?.category || "",
      iconName: initialData?.iconName || "",
    },
  });

  const { formState: { isSubmitting } } = form;
  
  async function onSubmit(values: SkillFormValues) {
    const skillData: Omit<SkillInput, 'id'> = {
      name: values.name,
      proficiency: values.proficiency,
      category: values.category,
      iconName: values.iconName || undefined, // Ensure empty string becomes undefined
    };

    const result = await onSubmitAction(skillData, initialData?.id);

    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      if (isEditing && result.id) {
        router.refresh(); 
      } else if (result.id) {
        router.push(`/admin/manage-skills/edit/${result.id}`);
      } else {
        router.push('/admin/manage-skills');
      }
    } else {
      toast({
        title: "Hata!",
        description: result.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) : void => {
          const fieldName = field as keyof SkillFormValues;
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
            <CardTitle className="font-headline text-xl text-primary">{isEditing ? "Yeteneği Düzenle" : "Yeni Yetenek Oluştur"}</CardTitle>
            <CardDescription>
              {isEditing ? "Mevcut yeteneğin detaylarını güncelleyin." : "Yeni bir yetenek için aşağıdaki alanları doldurun."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Yetenek Adı</FormLabel>
                <FormControl><Input {...field} placeholder="örn: React, Node.js, Proje Yönetimi" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl><Input {...field} placeholder="örn: Frontend, Backend, Araçlar" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="proficiency" render={({ field }) => (
              <FormItem>
                <FormLabel>Yetkinlik Seviyesi: {field.value}%</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="iconName" render={({ field }) => (
              <FormItem>
                <FormLabel>Lucide İkon Adı (Opsiyonel)</FormLabel>
                <FormControl><Input {...field} placeholder="örn: Code, Database, Brain" /></FormControl>
                <FormDescription><a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Lucide ikonları listesine bakın</a>. (Örn: 'Cpu', 'Server', 'Paintbrush')</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="min-w-[120px]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Değişiklikleri Kaydet" : "Yeteneği Oluştur"}
          </Button>
           <Button type="button" variant="outline" asChild>
              <Link href="/admin/manage-skills">
                <Undo className="mr-2 h-4 w-4"/> İptal
              </Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}
