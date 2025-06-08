
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu, Loader2, LogIn, Shield, Home, User, Briefcase, Sparkles, BookOpenText, MessageSquare, FileText, Lightbulb, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUserType } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { createSession } from '@/lib/actions/auth';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

// Statik Navigasyon Öğeleri
const staticNavItems = [
  { id: 'home', label: 'Anasayfa', href: '/#anasayfa-section', iconName: 'Home' },
  { id: 'about', label: 'Hakkımda', href: '/#hakkimda-section', iconName: 'User' },
  { id: 'services', label: 'Hizmetler', href: '/#hizmetler-section', iconName: 'Sparkles' },
  { id: 'projects', label: 'Projeler', href: '/#projeler-section', iconName: 'Briefcase' },
  { id: 'skills', label: 'Yetenekler', href: '/#yetenekler-section', iconName: 'Lightbulb' },
  { id: 'experience', label: 'Deneyimler', href: '/#deneyim-section', iconName: 'Award' },
  { id: 'resume', label: 'Özgeçmiş', href: '/#ozgecmis-section', iconName: 'FileText' },
  { id: 'blog', label: 'Blog', href: '/#blog-section', iconName: 'BookOpenText' },
  { id: 'contact', label: 'İletişim', href: '/#iletisim-section', iconName: 'MessageSquare' },
];

const adminNavItemData = { label: 'Admin Panel', href: '/admin', iconName: 'Shield' };

interface HeaderProps {
  initialIsAuthenticated: boolean;
  initialSiteTitle: string;
}

export default function Header({ initialIsAuthenticated, initialSiteTitle }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [siteTitle, setSiteTitle] = useState(initialSiteTitle);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log("[Header useEffect] Running. initialSiteTitle:", initialSiteTitle);
    setSiteTitle(initialSiteTitle);

    const unsubscribeAuth = onAuthStateChanged(firebaseClientAuth, (user) => {
      console.log("[Header onAuthStateChanged] Firebase user from SDK:", user ? user.uid : null);
      setCurrentUser(user);
    });

    return () => {
      console.log("[Header useEffect Cleanup] Unsubscribing auth listener.");
      unsubscribeAuth();
    };
  }, [initialSiteTitle]);

  const isAuthenticated = currentUser !== null;
  console.log("[Header Render] isAuthenticated:", isAuthenticated, "Site Title:", siteTitle);

  const NavLink = ({ href, children, onClick, className, disabled, iconName }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string, disabled?: boolean, iconName?: string }) => {
    const IconComponent = getLucideIcon(iconName);
    const pathname = usePathname(); // Moved usePathname here to be a hook
    const [isHashActive, setIsHashActive] = useState(false);

    useEffect(() => {
      const checkHash = () => {
        if (href.startsWith('/#') && pathname === '/') {
          // href is like '/#section-id', window.location.hash is like '#section-id'
          setIsHashActive(window.location.hash === href.substring(1));
        } else {
          setIsHashActive(false);
        }
      };

      if (typeof window !== 'undefined') {
        checkHash(); // Initial check
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
      }
    }, [href, pathname]);


    const isActive =
      (pathname === '/' && href === '/#anasayfa-section') || // Specific case for homepage link on homepage
      (href !== '/#anasayfa-section' && !href.startsWith('/#') && pathname === href) || // For non-hash links
      (href.startsWith('/#') && pathname === '/' && isHashActive); // For hash links on homepage


    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) onClick();
        if (href.startsWith('/#') && typeof window !== 'undefined') {
            const targetId = href.substring(href.indexOf('#') + 1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                if (window.history.pushState) {
                    const newPath = pathname === '/' ? href : `/${href}`;
                    window.history.pushState(null, '', newPath);
                } else {
                    window.location.hash = href.substring(1); // Fallback, ensure hash doesn't start with //
                }
            }
        }
    };

    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(
          "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
          "w-full justify-start",
          "md:w-auto md:justify-center",
          isActive && "bg-accent/10 text-accent-foreground font-semibold",
          className,
          disabled && "opacity-50 cursor-not-allowed"
      )} disabled={disabled} >
        <Link href={href} onClick={handleLinkClick}>
          {IconComponent && <IconComponent className={cn("h-4 w-4", children ? "mr-1.5" : "")} />}
          <span>{children}</span>
        </Link>
      </Button>
    );
  };

  const renderNavItems = (items: typeof staticNavItems, isMobile = false) => {
    console.log(`[Header renderNavItems] Rendering for ${isMobile ? 'Mobile' : 'Desktop'}. Item count: ${items.length}`);
    if (items.length === 0) {
        console.log(`[Header renderNavItems] No nav items to render for ${isMobile ? 'Mobile' : 'Desktop'}.`);
        return isMobile ? null : <span className="text-sm text-muted-foreground px-2">Navigasyon Tanımlanmamış</span>;
    }
    return items.map((item) => {
      const itemKey = `${isMobile ? 'mobile' : 'desktop'}-${item.id}`;
      const navLinkInstance = (
        <NavLink
          href={item.href}
          onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
          className={cn(isMobile ? "text-base py-2" : "", "whitespace-nowrap")}
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
      const userCredential = await signInWithEmailAndPassword(firebaseClientAuth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        setIsLoginDialogOpen(false);
        toast({ title: "Giriş Başarılı!", description: "Admin paneline yönlendiriliyorsunuz..." });
        router.push('/admin');
        router.refresh();
      } else {
        setLoginError(sessionResult.error || "Giriş yapılamadı. Lütfen tekrar deneyin.");
        toast({ title: "Giriş Başarısız", description: sessionResult.error || "Bir hata oluştu.", variant: "destructive" });
        await firebaseClientAuth.signOut();
      }
    } catch (error: any) {
      let message = "Giriş sırasında bir hata oluştu.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "E-posta veya şifre hatalı.";
      }
      setLoginError(message);
      toast({ title: "Giriş Hatası", description: message, variant: "destructive" });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  return (
    <>
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link
            href="/#anasayfa-section"
            className="text-2xl font-headline font-bold text-gradient"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              // @ts-ignore
              const href = e.currentTarget.getAttribute('href');
              if (typeof window !== 'undefined' && window.location.pathname === '/' && href && href.startsWith('/#')) {
                 e.preventDefault();
                 const targetId = href.substring(href.indexOf('#') + 1);
                 document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                 window.history.pushState(null, '', href);
              } else if (typeof window !== 'undefined' && window.location.pathname === '/') {
                 const targetElement = document.getElementById('anasayfa-section');
                  if (targetElement) {
                      e.preventDefault();
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                       window.history.pushState(null, '', '/#anasayfa-section');
                  }
              }
            }}
            key={`site-title-${siteTitle}`}
          >
            {siteTitle}
          </Link>

          <nav className="hidden md:flex space-x-1 items-center flex-wrap">
            {renderNavItems(staticNavItems, false)}
            {isAuthenticated ? (
              <NavLink
                key={`admin-panel-link-desktop-${isAuthenticated.toString()}-${currentUser?.uid}`}
                href={adminNavItemData.href}
                iconName={adminNavItemData.iconName}
              >
                {adminNavItemData.label}
              </NavLink>
            ) : (
              <Button variant="default" size="sm" onClick={() => setIsLoginDialogOpen(true)} disabled={isSubmittingLogin}>
                {isSubmittingLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Giriş Yap
              </Button>
            )}
          </nav>

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
                      <Link
                        href="/#anasayfa-section"
                        className="text-xl font-headline font-bold text-gradient"
                         onClick={(e) => {
                            setIsMobileMenuOpen(false);
                            // @ts-ignore
                            const href = e.currentTarget.getAttribute('href');
                             if (typeof window !== 'undefined' && window.location.pathname === '/' && href && href.startsWith('/#')) {
                                e.preventDefault();
                                const targetId = href.substring(href.indexOf('#') + 1);
                                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                                window.history.pushState(null, '', href);
                            } else if (typeof window !== 'undefined' && window.location.pathname === '/') {
                                const targetElement = document.getElementById('anasayfa-section');
                                if (targetElement) {
                                    e.preventDefault();
                                    targetElement.scrollIntoView({ behavior: 'smooth' });
                                     window.history.pushState(null, '', '/#anasayfa-section');
                                }
                            }
                        }}
                        key={`site-title-mobile-${siteTitle}`}
                      >
                        {siteTitle}
                      </Link>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-1 px-2 py-4">
                  {renderNavItems(staticNavItems, true)}
                  {isAuthenticated ? (
                    <SheetClose asChild>
                      <NavLink
                        key={`admin-panel-link-mobile-${isAuthenticated.toString()}-${currentUser?.uid}`}
                        href={adminNavItemData.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base py-2"
                        iconName={adminNavItemData.iconName}
                       >
                        {adminNavItemData.label}
                      </NavLink>
                    </SheetClose>
                  ) : (
                     <SheetClose asChild>
                        <Button variant="default" onClick={() => { setIsLoginDialogOpen(true); setIsMobileMenuOpen(false); }} className="text-base py-2 justify-start w-full mt-2" disabled={isSubmittingLogin}>
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
            <DialogTitle className="font-headline text-primary text-gradient">Admin Girişi</DialogTitle>
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
