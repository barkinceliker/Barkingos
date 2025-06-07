
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
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';

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

      console.log("LoginPage: About to set cookie. Initial document.cookie:", document.cookie);
      const cookieValue = "isLoggedIn=true; path=/; max-age=3600; SameSite=Lax"; // Expires in 1 hour
      document.cookie = cookieValue;
      console.log("LoginPage: Cookie set command executed. Attempted value:", cookieValue);
      console.log("LoginPage: document.cookie state immediately after set:", document.cookie);

      toast({
        title: "Giriş Başarılı!",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });

      // Add a small delay to allow cookie to propagate and check if it's readable
      setTimeout(() => {
        console.log("LoginPage: document.cookie state after 100ms delay:", document.cookie);
        const cookieIsSet = document.cookie.includes('isLoggedIn=true');
        console.log("LoginPage: Does document.cookie include 'isLoggedIn=true' after delay?", cookieIsSet);

        if (!cookieIsSet) {
            alert("CRITICAL: Cookie 'isLoggedIn=true' was not found in document.cookie after setting it. Login will likely fail to persist for middleware. Check browser cookie settings/extensions.");
        }

        console.log("LoginPage: Attempting redirect to /admin via window.location.href...");
        window.location.href = '/admin';
        // Fallback/additional log in case redirect is blocked
        setTimeout(() => console.log("LoginPage: window.location.href called. If you see this, redirect might be blocked or overridden."), 500);
      }, 100);

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
      setIsSubmitting(false); // Re-enable form on error
    }
    // Do not set isSubmitting to false here if successful, due to redirect
    console.log("LoginPage: onSubmit finished (may be waiting for redirect timeout).");
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
                      <Input type="email" placeholder="ornek@mail.com" {...field} disabled={isSubmitting} />
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
                      <Input type="password" placeholder="Şifreniz" {...field} disabled={isSubmitting} />
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
