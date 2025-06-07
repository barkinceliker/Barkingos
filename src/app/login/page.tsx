
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase"; // Import auth from your firebase setup
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation'; // Though we'll use window.location.href for reliability post-cookie set

const formSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("LoginPage: onSubmit triggered with values:", values);
    try {
      console.log("LoginPage: Attempting Firebase sign-in...");
      await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log("LoginPage: Firebase sign-in successful.");

      // Set a cookie to indicate login status
      const cookieValue = "isLoggedIn=true; path=/; max-age=3600; SameSite=Lax"; // Expires in 1 hour
      document.cookie = cookieValue;
      console.log("LoginPage: Cookie set:", cookieValue);
      console.log("LoginPage: Current document.cookie state:", document.cookie);


      toast({
        title: "Giriş Başarılı!",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });

      // Redirect to admin panel. Using window.location.href to ensure
      // the cookie is sent with the new request.
      console.log("LoginPage: Attempting redirect to /admin...");
      window.location.href = '/admin';
      // Fallback in case window.location.href is blocked or doesn't complete
      // setTimeout(() => router.push('/admin'), 100); 

    } catch (error: any) {
      console.error("LoginPage: Firebase sign-in error:", error);
      let errorMessage = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "E-posta veya şifre hatalı.";
      }
      toast({
        title: "Giriş Hatası!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // setIsSubmitting(false); // Commented out because of redirect
      console.log("LoginPage: onSubmit finished.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline text-primary">Admin Girişi</CardTitle>
          <CardDescription>Lütfen devam etmek için giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Şifreniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
