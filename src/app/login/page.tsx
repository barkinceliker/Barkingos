
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { auth } from '@/lib/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    // Check if user is already logged in (e.g. via cookie from previous session)
    // and redirect to admin if so. Middleware also handles this, but client-side check is good UX.
    if (document.cookie.includes('isLoggedIn=true')) {
      router.replace('/admin');
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("LoginPage: onSubmit triggered with values:", values);
    if (!isClientMounted) {
      console.log("LoginPage: onSubmit called before client mount, aborting.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("LoginPage: Attempting Firebase sign-in...");
      await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log("LoginPage: Firebase sign-in successful.");
      toast({
        title: "Giriş Başarılı!",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });

      console.log("LoginPage: About to set cookie. Initial document.cookie:", document.cookie);
      // Set a cookie to indicate logged-in state
      const expires = new Date();
      expires.setTime(expires.getTime() + (60 * 60 * 1000)); // 1 hour
      document.cookie = `isLoggedIn=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      console.log("LoginPage: Cookie set command executed: isLoggedIn=true; path=/; expires=...; SameSite=Lax");
      
      // Verify cookie presence (for debugging)
      console.log("LoginPage: document.cookie state immediately after set:", document.cookie);

      // Delay redirect slightly to allow cookie to propagate if needed
      // and to give a chance for console logs to be read.
      setTimeout(() => {
        console.log("LoginPage: document.cookie state after 100ms delay:", document.cookie);
        if (!document.cookie.includes('isLoggedIn=true')) {
          console.error("LoginPage: CRITICAL: Cookie 'isLoggedIn=true' was not found after attempting to set it and a delay.");
          alert("CRITICAL: Cookie 'isLoggedIn=true' was not found. Login may not persist. Check browser console and settings.");
        }
        console.log("LoginPage: Attempting redirect to /admin...");
        // Using router.replace for client-side navigation after state update
        router.replace('/admin'); 
        console.log("LoginPage: router.replace('/admin') called.");
      }, 100);

    } catch (error: any) {
      console.error("LoginPage: Firebase sign-in error:", error);
      toast({
        title: "Giriş Başarısız!",
        description: error.message || "E-posta veya şifre hatalı.",
        variant: "destructive",
      });
    } finally {
      // setIsSubmitting(false); // Delaying this or handling within setTimeout
      // to prevent premature re-enablement of the button if redirect is slow.
      // It's generally fine as page will redirect.
      console.log("LoginPage: onSubmit finished.");
    }
  }
  
  if (!isClientMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Girişi</CardTitle>
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
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
