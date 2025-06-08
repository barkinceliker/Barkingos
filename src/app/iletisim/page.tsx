
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Send, Loader2, Github, Linkedin } from 'lucide-react'; // Phone ikonu kaldırıldı
import { submitContactForm } from "@/lib/actions/contact"; 

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır.").max(50, "İsim en fazla 50 karakter olabilir."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır.").max(100, "Konu en fazla 100 karakter olabilir."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır.").max(1000, "Mesaj en fazla 1000 karakter olabilir."),
});

export default function IletisimPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await submitContactForm(values); 

      if (result.success) {
        toast({
          title: "Başarılı!",
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: "Hata!",
          description: result.message || "Mesaj gönderilirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sunucu Hatası!",
        description: "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">İletişim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Benimle iletişime geçmek, projeler hakkında konuşmak veya işbirliği yapmak için aşağıdaki formu kullanabilirsiniz.
        </p>
      </section>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-gradient">İletişim Bilgilerim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-6 w-6 mr-3 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">E-posta</h3>
                  <a href="mailto:mail.barkinclkr@gmail.com" className="text-foreground hover:text-primary">mail.barkinclkr@gmail.com</a>
                </div>
              </div>
              {/* Telefon bölümü kaldırıldı */}
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-3 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Adres</h3>
                  <p className="text-foreground">İzmir, Türkiye</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-gradient">Sosyal Medya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Github className="h-6 w-6 mr-3 text-accent flex-shrink-0" />
                  <a 
                    href="https://github.com/barkinceliker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    GitHub Profilim
                  </a>
                </div>
                <div className="flex items-center">
                  <Linkedin className="h-6 w-6 mr-3 text-accent flex-shrink-0" />
                  <a 
                    href="https://www.linkedin.com/in/celikerbarkin/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    LinkedIn Profilim
                  </a>
                </div>
              </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-gradient">Mesaj Gönderin</CardTitle>
              <CardDescription>Sorularınız veya önerileriniz için formu doldurun.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adınız Soyadınız</FormLabel>
                        <FormControl>
                          <Input placeholder="İsim Soyisim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta Adresiniz</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@mail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konu</FormLabel>
                        <FormControl>
                          <Input placeholder="Mesajınızın konusu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesajınız</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Mesajınızı buraya yazın..." rows={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gönderiliyor...</> : <><Send className="mr-2 h-4 w-4" /> Mesajı Gönder</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

