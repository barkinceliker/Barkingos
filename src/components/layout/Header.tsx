
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, User, BookOpen, Code as CodeIcon, BarChart, MessageSquare, Settings, FileText, Shield, Briefcase, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase'; // Client-side auth
import { createSession, logout as serverLogout, checkAuthStatus } from '@/lib/actions/auth';

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
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const { isAuthenticated: serverAuthStatus } = await checkAuthStatus();
        setIsAuthenticated(serverAuthStatus);
      } catch (e) {
        console.error("Error checking auth status on mount:", e);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    };
    checkStatus();
  }, [pathname]); // Re-check on path change, e.g. after redirect from login

  const NavLink = ({ href, children, onClick, className, disabled }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string, disabled?: boolean }) => (
    <Button asChild variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className, disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
  
  const mobileNavItems = [...mainNavItemsBase, ...(isAuthenticated ? [adminNavItem] : [])]; 

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingLogin(true);
    setLoginError(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const userCredential = await signInWithEmailAndPassword(firebaseClientAuth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        setIsAuthenticated(true);
        setIsLoginDialogOpen(false);
        toast({ title: "Giriş Başarılı!", description: "Admin paneline yönlendiriliyorsunuz..." });
        router.push('/admin'); // Or refresh to let middleware handle
        router.refresh(); 
      } else {
        setLoginError(sessionResult.error || "Giriş yapılamadı. Lütfen tekrar deneyin.");
        toast({ title: "Giriş Başarısız", description: sessionResult.error || "Bir hata oluştu.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Giriş sırasında bir hata oluştu.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "E-posta veya şifre hatalı.";
      } else if (error.message) {
        message = error.message;
      }
      setLoginError(message);
      toast({ title: "Giriş Hatası", description: message, variant: "destructive" });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmittingLogin(true); // Use same state for loading indicator
    try {
      await firebaseClientAuth.signOut(); // Sign out client-side
      const result = await serverLogout(); // Sign out server-side (clear cookie)
      if (result.success) {
        setIsAuthenticated(false);
        toast({ title: "Başarıyla çıkış yapıldı." });
        if (pathname.startsWith('/admin')) {
          router.push('/');
        }
        router.refresh();
      } else {
         toast({ title: "Çıkış Hatası", description: result.error || "Çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
       setIsSubmittingLogin(false);
    }
  };


  return (
    <>
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
            {isLoadingAuth ? (
              <Button variant="ghost" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yükleniyor...</Button>
            ) : isAuthenticated ? (
              <>
                <NavLink key={`desktop-${adminNavItem.label}`} href={adminNavItem.href}>
                  <adminNavItem.icon className="mr-2 h-5 w-5" /> {adminNavItem.label}
                </NavLink>
                <Button variant="outline" onClick={handleLogout} disabled={isSubmittingLogin}>
                  {isSubmittingLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
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
                  {mainNavItemsBase.map((item) => { // Always show base items
                    const IconComponent = item.icon;
                    return (
                      <SheetClose asChild key={`mobile-${item.label}`}>
                        <NavLink 
                          href={item.href} 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="text-base"
                        >
                          <IconComponent className="mr-3 h-5 w-5" />
                          {item.label}
                        </NavLink>
                      </SheetClose>
                    );
                  })}
                  {isLoadingAuth ? (
                     <Button variant="ghost" disabled className="text-base justify-start"><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Yükleniyor...</Button>
                  ) : isAuthenticated ? (
                    <>
                     <SheetClose asChild>
                        <NavLink href={adminNavItem.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                          <adminNavItem.icon className="mr-3 h-5 w-5" /> {adminNavItem.label}
                        </NavLink>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false);}} className="text-base justify-start w-full mt-2" disabled={isSubmittingLogin}>
                           {isSubmittingLogin ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <LogOut className="mr-3 h-5 w-5" />}
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
            <DialogTitle className="font-headline text-primary">Admin Girişi</DialogTitle>
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
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmittingLogin}>
                  İptal
                </Button>
              </DialogClose>
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
