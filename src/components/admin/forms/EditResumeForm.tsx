
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
import { ResumePageContent, updateResumeContent } from "@/lib/actions/resume-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, ClipboardUser } from "lucide-react";
import { useRouter } from "next/navigation";

const resumePageContentSchema = z.object({
  name: z.string().min(1, "Ad Soyad gereklidir."),
  title: z.string().min(1, "Unvan gereklidir."),
  profileImageUrl: z.string().url("Geçerli bir profil resmi URL'si giriniz.").or(z.literal('')).optional(),
  profileImageAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  phone: z.string().optional(),
  linkedinUrl: z.string().url("Geçerli bir LinkedIn URL'si giriniz.").optional().or(z.literal('')),
  githubUrl: z.string().url("Geçerli bir GitHub URL'si giriniz.").optional().or(z.literal('')),
  location: z.string().optional(),
  summary: z.string().min(1, "Özet gereklidir."),
  experiencesString: z.string().min(1, "Deneyimler gereklidir. Her bir deneyim bloğunu '---' ile ayırın."),
  educationString: z.string().min(1, "Eğitim bilgileri gereklidir. Her bir eğitim bloğunu '---' ile ayırın."),
  skillsString: z.string().min(1, "Beceriler gereklidir (virgülle ayrılmış)."),
  resumePdfUrl: z.string().url("Geçerli bir PDF URL'si giriniz.").or(z.literal('')).optional(),
});

type EditResumeFormValues = z.infer<typeof resumePageContentSchema>;

interface EditResumeFormProps {
  initialData: ResumePageContent;
}

export default function EditResumeForm({ initialData }: EditResumeFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditResumeFormValues>({
    resolver: zodResolver(resumePageContentSchema),
    defaultValues: {
      name: initialData.name || "",
      title: initialData.title || "",
      profileImageUrl: initialData.profileImageUrl || "https://placehold.co/150x150.png",
      profileImageAiHint: initialData.profileImageAiHint || "professional headshot",
      email: initialData.email || "",
      phone: initialData.phone || "",
      linkedinUrl: initialData.linkedinUrl || "",
      githubUrl: initialData.githubUrl || "",
      location: initialData.location || "",
      summary: initialData.summary || "",
      experiencesString: initialData.experiencesString || "",
      educationString: initialData.educationString || "",
      skillsString: initialData.skillsString || "",
      resumePdfUrl: initialData.resumePdfUrl || "/resume-placeholder.pdf",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: EditResumeFormValues) {
    try {
      const dataToSubmit: Omit<ResumePageContent, 'id' | 'updatedAt'> = {
        ...values,
        profileImageUrl: values.profileImageUrl || 'https://placehold.co/150x150.png',
        profileImageAiHint: values.profileImageAiHint || (values.profileImageUrl ? 'professional headshot' : 'placeholder image'),
        resumePdfUrl: values.resumePdfUrl || "/resume-placeholder.pdf",
      };
      
      const result = await updateResumeContent(dataToSubmit);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        router.refresh(); 
      } else {
        toast({
          title: "Hata!",
          description: result.message || "Özgeçmiş güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            const fieldName = field as keyof EditResumeFormValues; 
            const message = Array.isArray(messages) ? messages.join(', ') : typeof messages === 'string' ? messages : 'Bilinmeyen hata';
            form.setError(fieldName, { type: "manual", message });
          });
        }
      }
    } catch (error) {
      toast({
        title: "Sunucu Hatası!",
        description: "Özgeçmiş güncellenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-gradient flex items-center">
              <ClipboardUser className="mr-3 h-6 w-6" /> Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Adınız Soyadınız</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Unvanınız</FormLabel>
                <FormControl><Input {...field} placeholder="örn: Kıdemli Yazılım Geliştirici" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profileImageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Profil Resmi URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://placehold.co/150x150.png" /></FormControl>
                <FormDescription>Tam bir URL girin. Boş bırakırsanız varsayılan placeholder kullanılır.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profileImageAiHint" render={({ field }) => (
              <FormItem>
                <FormLabel>Profil Resmi AI İpucu (data-ai-hint)</FormLabel>
                <FormControl><Input {...field} placeholder="professional headshot" /></FormControl>
                <FormDescription>Resim için 1-2 anahtar kelime.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">İletişim Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>E-posta</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Telefon (Opsiyonel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
              <FormItem><FormLabel>LinkedIn URL (Opsiyonel)</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="githubUrl" render={({ field }) => (
              <FormItem><FormLabel>GitHub URL (Opsiyonel)</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Konum (Opsiyonel)</FormLabel><FormControl><Input {...field} placeholder="örn: İzmir, Türkiye" /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">Özet</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem>
                <FormLabel>Kariyer Özeti / Hakkımda Yazısı</FormLabel>
                <FormControl><Textarea {...field} rows={5} /></FormControl>
                <FormDescription>Özgeçmişinizde görünecek kısa bir giriş veya özet.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">Deneyimler</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="experiencesString" render={({ field }) => (
              <FormItem>
                <FormLabel>İş Deneyimleri</FormLabel>
                <FormControl><Textarea {...field} rows={10} /></FormControl>
                <FormDescription>
                  Her bir deneyimi ayrı bir blok olarak girin. Blokları "---" (üç tire) ile ayırın.
                  Her blokta Rol, Şirket, Dönem ve görevleri ayrı satırlarda belirtin. Örnek:
                  <br />
                  <code>Rol: Kıdemli Geliştirici</code><br />
                  <code>Şirket: Teknoloji A.Ş.</code><br />
                  <code>Dönem: Ocak 2020 - Aralık 2022</code><br />
                  <code>- Görev 1 açıklaması</code><br />
                  <code>- Görev 2 açıklaması</code><br />
                  <code>---</code><br />
                  <code>Rol: Geliştirici</code><br />
                  <code>...</code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">Eğitim Bilgileri</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="educationString" render={({ field }) => (
              <FormItem>
                <FormLabel>Eğitim Geçmişi</FormLabel>
                <FormControl><Textarea {...field} rows={6} /></FormControl>
                <FormDescription>
                  Her bir eğitim bilgisini ayrı bir blok olarak girin. Blokları "---" (üç tire) ile ayırın.
                  Her blokta Derece, Üniversite ve Dönem bilgilerini ayrı satırlarda belirtin. Örnek:
                  <br />
                  <code>Derece: Bilgisayar Müh. Lisans</code><br />
                  <code>Üniversite: Örnek Üniversitesi</code><br />
                  <code>Dönem: 2015 - 2019</code><br />
                  <code>---</code><br />
                  <code>Derece: Lise Adı</code><br />
                  <code>...</code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">Beceriler</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="skillsString" render={({ field }) => (
              <FormItem>
                <FormLabel>Teknik ve Sosyal Beceriler</FormLabel>
                <FormControl><Textarea {...field} rows={4} /></FormControl>
                <FormDescription>Becerilerinizi virgülle (,) ayırarak giriniz. Örn: React, Next.js, Problem Çözme</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader><CardTitle className="font-headline text-xl text-gradient">PDF Özgeçmiş</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="resumePdfUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>İndirilebilir PDF Özgeçmiş URL'si</FormLabel>
                <FormControl><Input type="url" {...field} /></FormControl>
                <FormDescription>Özgeçmişinizin PDF dosyasının tam URL'si. Boş bırakırsanız varsayılan bir placeholder linki kullanılır.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Özgeçmiş Bilgilerini Kaydet
        </Button>
      </form>
    </Form>
  );
}

    