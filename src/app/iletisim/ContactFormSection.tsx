
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
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { submitContactForm } from "@/lib/actions/contact"; 

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır.").max(50, "İsim en fazla 50 karakter olabilir."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır.").max(100, "Konu en fazla 100 karakter olabilir."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır.").max(1000, "Mesaj en fazla 1000 karakter olabilir."),
});

export default function ContactFormSection() {
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
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">İletişim Bilgilerim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-6 w-6 mr-3 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">E-posta</h3>
                  <a href="mailto:örnek@mail.com" className="text-foreground hover:text-primary">örnek@mail.com</a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 mr-3 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Telefon</h3>
                  <a href="tel:+905551234567" className="text-foreground hover:text-primary">+90 555 123 45 67</a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-3 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Adres</h3>
                  <p className="text-foreground">Örnek Mahallesi, Test Sokak No:123, İstanbul, Türkiye</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Sosyal Medya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Add social media links here later */}
              <p className="text-muted-foreground">Yakında eklenecek...</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Mesaj Gönderin</CardTitle>
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
  );
}

    