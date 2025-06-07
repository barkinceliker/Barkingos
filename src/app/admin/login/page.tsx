
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure navigator object is available
  }, []);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setAuthError(null);
    console.log("LoginPage: onSubmit triggered with values:", data);

    if (isClient && !navigator.cookieEnabled) {
      console.error("CRITICAL: Cookies are disabled in this browser!");
      setAuthError("Tarayıcınızda çerezler devre dışı bırakılmış. Lütfen etkinleştirip tekrar deneyin.");
      toast({
        title: "Çerez Hatası",
        description: "Tarayıcınızda çerezler devre dışı bırakılmış. Lütfen etkinleştirip tekrar deneyin.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("LoginPage: Attempting Firebase sign-in...");
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("LoginPage: Firebase sign-in successful. User email:", userCredential.user?.email);

      if (userCredential.user) {
        const token = await userCredential.user.getIdToken();
        console.log("LoginPage: Firebase ID Token retrieved:", token ? token.substring(0, 30) + "..." : "EMPTY OR NULL TOKEN");

        if (!token) {
          console.error("CRITICAL: Firebase ID Token is null or empty. Cannot set cookie.");
          setAuthError("Kullanıcı token alınamadı (token boş).");
          toast({ title: "Giriş Hatası", description: "Kullanıcı token alınamadı (token boş).", variant: "destructive" });
          return;
        }

        // Using a simpler cookie string for maximum compatibility, though the previous one was fine.
        // Max-age is in seconds (1 hour = 3600 seconds)
        const cookieString = `firebaseIdToken=${token}; path=/; max-age=3600; SameSite=Lax`;
        
        console.log("LoginPage: About to set firebaseIdToken cookie. Initial document.cookie:", document.cookie);
        console.log("LoginPage: Cookie string to be set:", cookieString);
        document.cookie = cookieString;
        console.log("LoginPage: firebaseIdToken cookie set command executed.");
        // Allow a brief moment for the cookie to be processed by the browser
        // Reading document.cookie immediately after setting it might not always reflect the change synchronously in all environments/browsers.
        console.log("LoginPage: document.cookie state immediately after set (may not be final):", document.cookie);


        toast({
          title: "Giriş Başarılı!",
          description: "Admin paneline yönlendiriliyorsunuz...",
        });

        // Small delay to help ensure cookie is processed by browser before redirect
        setTimeout(() => {
          console.log("LoginPage: document.cookie state after 100ms delay:", document.cookie);
          const isCookieSet = document.cookie.includes('firebaseIdToken=');
          console.log("LoginPage: Does document.cookie include 'firebaseIdToken=' after delay?", isCookieSet);

          if (!isCookieSet) {
            console.error("CRITICAL: Cookie 'firebaseIdToken' was not found client-side after setting and delay. Redirect might fail or loop.");
          }
          console.log("LoginPage: Attempting redirect to /admin via router.push...");
          router.push("/admin");
          console.log("LoginPage: router.push('/admin') called.");
        }, 100);

      } else {
        console.error("LoginPage: UserCredential.user is null after successful sign-in.");
        throw new Error("Kullanıcı bilgileri alınamadı.");
      }
    } catch (e: any) {
      console.error("LoginPage: Firebase sign-in or token error:", e);
      let errorMessage = "E-posta veya şifre yanlış.";
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        errorMessage = "Geçersiz e-posta veya şifre.";
      } else if (e.code === 'auth/too-many-requests') {
        errorMessage = "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.";
      }
      setAuthError(errorMessage);
      toast({
        title: "Giriş Başarısız",
        description: errorMessage,
        variant: "destructive",
      });
    }
    console.log("LoginPage: onSubmit finished.");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Girişi</CardTitle>
          <CardDescription>Lütfen devam etmek için giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register("email", { 
                  required: "E-posta adresi gereklidir.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Geçersiz e-posta adresi."
                  }
                })}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { required: "Şifre gereklidir." })}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {authError && <p className="text-sm text-destructive text-center">{authError}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Giriş yapmak için yetkili bir admin hesabınız olmalıdır.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
