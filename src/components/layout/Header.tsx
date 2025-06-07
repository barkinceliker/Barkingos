
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu, X, Loader2, LogIn, Shield, LogOut as LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle as RadixDialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { createSession, logout as serverLogout } from '@/lib/actions/auth';
import type { LucideIcon } from 'lucide-react';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

const staticNavItems = [
  { label: 'Anasayfa', href: '/', iconName: 'Home' },
  { label: 'Hakkımda', href: '/hakkimda', iconName: 'User' },
  { label: 'Hizmetler', href: '/hizmetler', iconName: 'Sparkles' },
  { label: 'Projeler', href: '/projeler', iconName: 'Laptop' },
  { label: 'Yetenekler', href: '/yetenekler', iconName: 'Lightbulb' },
  { label: 'Deneyim', href: '/deneyim', iconName: 'Award' },
  { label: 'Blog', href: '/blog', iconName: 'BookOpen' },
  { label: 'İletişim', href: '/iletisim', iconName: 'MessageSquare' },
];

const adminNavItemData = { label: 'Admin Panel', href: '/admin', iconName: 'Shield' };

interface HeaderProps {
  initialIsAuthenticated: boolean;
}

export default function Header({ initialIsAuthenticated }: HeaderProps) {
  console.log("[Header] Rendering with initialIsAuthenticated prop:", initialIsAuthenticated);

  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Firebase user object
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, (user) => {
      console.log("[Header onAuthStateChanged] Firebase user:", user ? user.uid : null);
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);
  
  // Sync with server-provided initial state, but let onAuthStateChanged take precedence once it fires.
  useEffect(() => {
    console.log("[Header initialIsAuthenticated useEffect] initialIsAuthenticated prop:", initialIsAuthenticated, "currentUser:", currentUser);
    // This effect primarily ensures that if onAuthStateChanged hasn't fired yet,
    // the UI reflects the server's idea of auth state.
    // Once onAuthStateChanged fires, its determination is the source of truth for `isAuthenticated`.
    // This logic handles the case where the component might render with `initialIsAuthenticated`
    // before `onAuthStateChanged` has had a chance to update `currentUser` and `isAuthenticated`.
    if (currentUser === null) { // Only if onAuthStateChanged hasn't determined the user yet
        setIsAuthenticated(initialIsAuthenticated);
    }
  }, [initialIsAuthenticated, currentUser]);


  const NavLink = ({ href, children, onClick, className, disabled, iconName }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string, disabled?: boolean, iconName?: string }) => {
    const IconComponent = getLucideIcon(iconName);
    const isActive = pathname === href;
    return (
      <Button asChild variant="ghost" className={cn(
        "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
        "w-full justify-start",
        "md:w-auto md:justify-center",
        isActive && "bg-accent/10 text-accent-foreground font-semibold",
        className,
        disabled && "opacity-50 cursor-not-allowed"
      )} disabled={disabled} >
        <Link href={href} onClick={onClick}>
          {IconComponent && <IconComponent className={cn("h-5 w-5", children ? "mr-2" : "")} />}
          <span>{children}</span>
        </Link>
      </Button>
    );
  };

  const renderNavItems = (items: typeof staticNavItems, isMobile = false) => {
    return items.map((item) => {
      const itemKey = `${isMobile ? 'mobile' : 'desktop'}-${item.href}`;
      const navLinkInstance = (
        <NavLink
          href={item.href}
          onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
          className={isMobile ? "text-base" : ""}
          iconName={item.iconName}
        >
          {item.label}
        </NavLink>
      );
      if (isMobile) {
        return (
          <SheetClose asChild key={`sheetclose-${itemKey}`}>
            {navLinkInstance}
          </SheetClose>
        );
      }
      return React.cloneElement(navLinkInstance, { key: itemKey });
    });
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log("[Header handleLoginSubmit] Attempting client-side login...");
      const userCredential = await signInWithEmailAndPassword(firebaseClientAuth, email, password);
      // onAuthStateChanged will set isAuthenticated to true and currentUser
      console.log("[Header handleLoginSubmit] Client-side login successful for UID:", userCredential.user.uid);

      const idToken = await userCredential.user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        setIsLoginDialogOpen(false);
        toast({ title: "Giriş Başarılı!", description: "Admin paneline yönlendiriliyorsunuz..." });
        router.push('/admin');
      } else {
        setLoginError(sessionResult.error || "Giriş yapılamadı. Lütfen tekrar deneyin.");
        toast({ title: "Giriş Başarısız", description: sessionResult.error || "Bir hata oluştu.", variant: "destructive" });
        await firebaseClientAuth.signOut(); // Ensure client is signed out if server session fails
      }
    } catch (error: any) {
      console.error("[Header handleLoginSubmit] Login error:", error);
      let message = "Giriş sırasında bir hata oluştu.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "E-posta veya şifre hatalı.";
      }
      setLoginError(message);
      toast({ title: "Giriş Hatası", description: message, variant: "destructive" });
    } finally {
      setIsSubmittingLogin(false);
      router.refresh(); // Refresh to ensure server components update with new auth state from cookie
    }
  };

  const handleHeaderLogout = async () => {
    setIsSubmittingLogout(true);
    console.log("[Header handleHeaderLogout] Attempting logout...");
    try {
      await firebaseClientAuth.signOut(); // Client-side sign out
      // onAuthStateChanged will set isAuthenticated to false

      const result = await serverLogout(); // Server-side cookie deletion
      console.log("[Header handleHeaderLogout] serverLogout result:", result);
      if (result.success) {
        toast({ title: "Başarıyla çıkış yapıldı." });
      } else {
        toast({ title: "Çıkış Hatası", description: result.error || "Sunucu tarafında çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }
      
      if (pathname.startsWith('/admin')) {
        router.push('/');
      }
    } catch (error) {
      console.error("[Header handleHeaderLogout] Logout error:", error);
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingLogout(false);
      router.refresh(); // Refresh to ensure server components reflect logged-out state
    }
  };
  
  console.log("[Header Actual Render] isAuthenticated state:", isAuthenticated, "currentUser:", currentUser ? currentUser.uid : null);

  return (
    <>
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="text-2xl font-headline font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
            BenimSitem
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center flex-wrap">
            {renderNavItems(staticNavItems, false)}

            {isAuthenticated ? (
              <>
                <NavLink key={`admin-panel-link-desktop-${isAuthenticated}`} href={adminNavItemData.href} iconName={adminNavItemData.iconName}>
                  {adminNavItemData.label}
                </NavLink>
                <Button variant="outline" onClick={handleHeaderLogout} disabled={isSubmittingLogout}>
                  {isSubmittingLogout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOutIcon className="mr-2 h-5 w-5" />}
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setIsLoginDialogOpen(true)} disabled={isSubmittingLogin}>
                {isSubmittingLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                Giriş Yap
              </Button>
            )}
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Menüyü Aç">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
                <SheetHeader className="p-4 border-b">
                   <SheetTitle asChild>
                      <Link href="/" className="text-xl font-headline font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                        BenimSitem
                      </Link>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-1 px-2 py-4">
                  {renderNavItems(staticNavItems, true)}

                  {isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <NavLink key={`admin-panel-link-mobile-${isAuthenticated}`} href={adminNavItemData.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base" iconName={adminNavItemData.iconName}>
                          {adminNavItemData.label}
                        </NavLink>
                      </SheetClose>
                       <SheetClose asChild>
                        <Button variant="outline" onClick={() => { handleHeaderLogout(); setIsMobileMenuOpen(false); }} className="text-base justify-start w-full mt-2" disabled={isSubmittingLogout}>
                          {isSubmittingLogout ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <LogOutIcon className="mr-3 h-5 w-5" />}
                          Çıkış Yap
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                     <SheetClose asChild>
                        <Button variant="default" onClick={() => { setIsLoginDialogOpen(true); setIsMobileMenuOpen(false); }} className="text-base justify-start w-full mt-2" disabled={isSubmittingLogin}>
                          {isSubmittingLogin ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <LogIn className="mr-3 h-5 w-5" />}
                          Giriş Yap
                        </Button>
                      </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <RadixDialogTitle className="font-headline text-primary">Admin Girişi</RadixDialogTitle>
            <DialogDescription>
              Lütfen admin paneline erişmek için e-posta ve şifrenizi girin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-login" className="text-right">
                  E-posta
                </Label>
                <Input id="email-login" name="email" type="email" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-login" className="text-right">
                  Şifre
                </Label>
                <Input id="password-login" name="password" type="password" required className="col-span-3" />
              </div>
              {loginError && (
                <p className="col-span-4 text-sm text-destructive text-center">{loginError}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Giriş Yap
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    