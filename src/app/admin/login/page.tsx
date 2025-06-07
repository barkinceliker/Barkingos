
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSession } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { auth as firebaseClientAuth } from "@/lib/firebase"; // Client auth instance

const formSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': // General invalid credential error
      return 'E-posta veya şifre hatalı.';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta formatı.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
    default:
      return 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Step 1: Sign in with Firebase on the client
      const userCredential = await signInWithEmailAndPassword(firebaseClientAuth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        const idToken = await user.getIdToken(true); // Force refresh token
        
        // Step 2: Send ID token to server action to create session
        const sessionResult = await createSession(idToken);

        if (sessionResult.success) {
          toast({
            title: "Giriş Başarılı!",
            description: "Admin paneline yönlendiriliyorsunuz...",
          });
          router.push("/admin"); // Redirect to admin dashboard
        } else {
          setErrorMsg(sessionResult.error || "Oturum oluşturulamadı.");
          toast({
            title: "Oturum Hatası",
            description: sessionResult.error || "Oturum oluşturulurken bir hata oluştu.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Firebase user not found after sign-in.");
      }
    } catch (error) {
      const firebaseError = error as AuthError;
      const message = firebaseError.code ? getFirebaseAuthErrorMessage(firebaseError.code) : "Bir hata oluştu. Lütfen tekrar deneyin.";
      setErrorMsg(message);
      toast({
        title: "Giriş Başarısız",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Girişi</CardTitle>
          <CardDescription>Lütfen devam etmek için giriş yapınız.</CardDescription>
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
                      <Input type="email" placeholder="admin@example.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMsg && (
                <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              )}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Giriş Yap
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
