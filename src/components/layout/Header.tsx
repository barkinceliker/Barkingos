
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, User, BookOpen, Code as CodeIcon, BarChart, MessageSquare, Settings, FileText, Shield, Briefcase, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { createSession, logout as serverLogout, checkAuthStatus } from '@/lib/actions/auth';

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});
type LoginFormInputs = z.infer<typeof loginSchema>;

const mainNavItemsBase = [
  { label: 'Anasayfa', href: '/', icon: Home },
  { label: 'Hakkımda', href: '/hakkimda', icon: User },
  { label: 'Portföy', href: '/portfoy', icon: Briefcase },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Projeler', href: '/projeler', icon: CodeIcon },
  { label: 'Yetenekler', href: '/yetenekler', icon: BarChart },
  { label: 'Deneyim', href: '/deneyim', icon: Briefcase },
  { label: 'İletişim', href: '/iletisim', icon: MessageSquare },
  { label: 'Hizmetler', href: '/hizmetler', icon: Settings },
  { label: 'CV / Özgeçmiş', href: '/resume', icon: FileText },
];

const adminNavItem = { label: 'Admin Panel', href: '/admin', icon: Shield };

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For login popover
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginPopoverOpen, setIsLoginPopoverOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      const authStatus = await checkAuthStatus();
      setIsLoggedIn(authStatus.isAuthenticated);
    };
    checkSession();

    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // This confirms Firebase client-side auth.
        // Now, ensure server session is also aligned.
        const authStatus = await checkAuthStatus();
        setIsLoggedIn(authStatus.isAuthenticated);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        setIsLoggedIn(true);
        toast({ title: "Giriş Başarılı!", description: "Admin paneline yönlendiriliyorsunuz." });
        setIsLoginPopoverOpen(false); // Close popover
        reset(); // Reset form
        router.push('/admin'); // Redirect to admin
      } else {
        setLoginError(sessionResult.error || "Sunucu tarafında oturum oluşturulamadı.");
        setIsLoggedIn(false); // Ensure logged out state if server session fails
        await signOut(auth); // Sign out from Firebase client if server session fails
      }
    } catch (e: any) {
      console.error("Firebase login error:", e);
      const friendlyMessage = e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
        ? "E-posta veya şifre hatalı."
        : "Giriş sırasında bir hata oluştu.";
      setLoginError(friendlyMessage);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await serverLogout(); // Clear server session cookie
      await signOut(auth); // Sign out from Firebase
      setIsLoggedIn(false);
      toast({ title: "Çıkış Başarılı", description: "Güvenli bir şekilde çıkış yaptınız." });
      router.push('/'); // Redirect to home
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Hata", description: "Çıkış sırasında bir sorun oluştu.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const NavLink = ({ href, children, onClick, className, disabled }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string, disabled?: boolean }) => (
    <Button asChild variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className, disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
  
  const mobileNavItems = [...mainNavItemsBase, { ...adminNavItem, disabled: !isLoggedIn }];

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          BenimSitem
        </Link>

        <nav className="hidden md:flex space-x-1 items-center flex-wrap">
          {mainNavItemsBase.map((item) => (
            <NavLink key={`desktop-${item.label}`} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <NavLink key={`desktop-${adminNavItem.label}`} href={adminNavItem.href} disabled={!isLoggedIn}>
             <adminNavItem.icon className="mr-2 h-5 w-5" /> {adminNavItem.label}
          </NavLink>
          {isLoggedIn ? (
            <Button variant="ghost" onClick={handleLogout} disabled={isLoading} className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
              <LogOutIcon className="mr-2 h-5 w-5" /> Çıkış Yap
            </Button>
          ) : (
            <Popover open={isLoginPopoverOpen} onOpenChange={setIsLoginPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                  <LogIn className="mr-2 h-5 w-5" /> Giriş Yap
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Admin Girişi</h4>
                    <p className="text-sm text-muted-foreground">
                      Devam etmek için giriş yapın.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="email-popover">E-posta</Label>
                      <Input
                        id="email-popover"
                        type="email"
                        {...register("email")}
                        className="col-span-2 h-8"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive col-start-2 col-span-2">{errors.email.message}</p>}
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="password-popover">Şifre</Label>
                      <Input
                        id="password-popover"
                        type="password"
                        {...register("password")}
                        className="col-span-2 h-8"
                        disabled={isLoading}
                      />
                    </div>
                     {errors.password && <p className="text-xs text-destructive col-start-2 col-span-2">{errors.password.message}</p>}
                  </div>
                  {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          )}
        </nav>
        
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
              <div className="flex justify-between items-center mb-6 p-4 border-b">
                 <Link href="/" className="text-xl font-headline font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    BenimSitem
                  </Link>
                <SheetClose asChild>
                   <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-1 px-2">
                {mobileNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SheetClose asChild key={`mobile-${item.label}`}>
                      <NavLink 
                        href={item.href} 
                        onClick={() => {
                          if (item.disabled) return;
                          setIsMobileMenuOpen(false)
                        }} 
                        className="text-base"
                        disabled={item.disabled}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  );
                })}
                {isLoggedIn ? (
                  <SheetClose asChild>
                    <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} disabled={isLoading} className="text-base w-full justify-start">
                      <LogOutIcon className="mr-3 h-5 w-5" /> Çıkış Yap
                    </Button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                     <Button variant="ghost" onClick={() => { setIsLoginPopoverOpen(true); setIsMobileMenuOpen(false);}} className="text-base w-full justify-start">
                        <LogIn className="mr-3 h-5 w-5" /> Giriş Yap
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

    