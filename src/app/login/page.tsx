
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn as LogInIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("LoginPage: onSubmit triggered with values:", values);
    setIsLoading(true);
    try {
      console.log("LoginPage: Attempting Firebase sign-in...");
      await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log("LoginPage: Firebase sign-in successful.");
      toast({
        title: "Giriş Başarılı!",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });
      
      // Set a cookie to indicate the user is logged in
      // This cookie will be checked by the middleware
      const cookieValue = "isLoggedIn=true; path=/; max-age=3600; SameSite=Lax"; // Expires in 1 hour
      document.cookie = cookieValue;
      console.log("LoginPage: Cookie set:", cookieValue);
      console.log("LoginPage: Current document.cookie state:", document.cookie);


      // Redirect to admin page. Full page navigation ensures cookie is sent.
      console.log("LoginPage: Attempting redirect to /admin...");
      window.location.href = '/admin';
      // Note: Code after window.location.href might not execute if redirect is immediate.
      console.log("LoginPage: window.location.href called. If you see this, redirect might be blocked or overridden.");

    } catch (error: any) {
      let errorMessage = "Giriş sırasında bir hata oluştu.";
      // More specific error messages based on Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "E-posta veya şifre hatalı.";
      }
      console.error("LoginPage: Login error:", error.code, error.message, error);
      toast({
        title: "Giriş Başarısız!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("LoginPage: onSubmit finished.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Admin Girişi</CardTitle>
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
                    <FormLabel>E-posta Adresi</FormLabel>
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Giriş Yapılıyor..." : <>Giriş Yap <LogInIcon className="ml-2 h-5 w-5" /></>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
