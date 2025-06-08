
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Loader2, LogIn, Shield, X as XIcon } from 'lucide-react'; // XIcon olarak import edildi
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
import { signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUserType, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { createSession, logout as serverLogout } from '@/lib/actions/auth';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

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
const logoutNavItemData = { label: 'Çıkış Yap', action: 'logout', iconName: 'LogOut' };

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
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);
  const [siteTitle, setSiteTitle] = useState(initialSiteTitle);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setSiteTitle(initialSiteTitle);
    const unsubscribeAuth = onAuthStateChanged(firebaseClientAuth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, [initialSiteTitle]);

  const isAuthenticated = currentUser !== null;

  const handleLogout = async () => {
    setIsSubmittingLogout(true);
    try {
      await firebaseSignOut(firebaseClientAuth);
      const result = await serverLogout();
      if (result.success) {
        toast({ title: "Başarıyla çıkış yapıldı." });
      } else {
        toast({ title: "Çıkış Hatası", description: result.error || "Sunucu tarafında çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }
      if (pathname.startsWith('/admin')) {
        router.push('/');
      }
      setIsMobileMenuOpen(false); // Mobil menüyü kapat
      router.refresh();
    } catch (error) {
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingLogout(false);
    }
  };


  const NavLink = ({ href, children, onClick, className, disabled, iconName, isAction }: { href?: string; children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; iconName?: string; isAction?: boolean }) => {
    const IconComponent = getLucideIcon(iconName);
    const currentPathname = usePathname();
    const [isHashActive, setIsHashActive] = useState(false);

    useEffect(() => {
      const checkHash = () => {
        if (href && href.startsWith('/#') && currentPathname === '/') {
          setIsHashActive(window.location.hash === href.substring(1));
        } else {
          setIsHashActive(false);
        }
      };

      if (typeof window !== 'undefined' && href) {
        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
      }
    }, [href, currentPathname]);

    const isActive = href ?
      (currentPathname === '/' && href === '/#anasayfa-section' && (typeof window !== 'undefined' && !window.location.hash)) ||
      (href.startsWith('/#') && currentPathname === '/' && isHashActive) ||
      (currentPathname === href && !href.startsWith('/#'))
      : false;

    const handleLinkClick = (e: React.MouseEvent) => {
      if (onClick) onClick();
      if (href && href.startsWith('/#') && typeof window !== 'undefined') {
        const targetId = href.substring(href.indexOf('#') + 1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.history.pushState) {
            const newPath = currentPathname === '/' ? href : `/${href}`;
            window.history.pushState(null, '', newPath);
          } else {
            window.location.hash = href.substring(1);
          }
        }
      }
      setIsMobileMenuOpen(false); // Her link veya action tıklandığında mobil menüyü kapat
    };

    const commonClasses = cn(
      "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
      "w-full justify-start text-sm py-2 px-3 rounded-md", // Genel stil
      isActive && !isAction && "bg-accent/20 text-accent-foreground font-semibold",
      className,
      disabled && "opacity-50 cursor-not-allowed"
    );

    if (isAction) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className={commonClasses}
          disabled={disabled}
        >
          {IconComponent && <IconComponent className={cn("h-4 w-4", children ? "mr-2" : "")} />}
          <span>{children}</span>
        </Button>
      );
    }

    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={commonClasses}
        disabled={disabled}
      >
        <Link href={href || '#'} onClick={handleLinkClick}>
          {IconComponent && <IconComponent className={cn("h-4 w-4", children ? "mr-2" : "")} />}
          <span>{children}</span>
        </Link>
      </Button>
    );
  };
  
  const renderNavItemsForSheet = () => {
    return (
      <>
        {staticNavItems.map((item) => (
          <SheetClose asChild key={`sheet-nav-${item.id}`}>
            <NavLink href={item.href} iconName={item.iconName} className="text-base py-2.5 px-4">
              {item.label}
            </NavLink>
          </SheetClose>
        ))}
        {isAuthenticated && (
          <>
            <div className="my-2 border-t border-border" />
            <SheetClose asChild>
              <NavLink href={adminNavItemData.href} iconName={adminNavItemData.iconName} className="text-base py-2.5 px-4">
                {adminNavItemData.label}
              </NavLink>
            </SheetClose>
            <SheetClose asChild>
               <NavLink onClick={handleLogout} isAction iconName={logoutNavItemData.iconName} className="text-base py-2.5 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isSubmittingLogout}>
                 {isSubmittingLogout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {logoutNavItemData.label}
               </NavLink>
            </SheetClose>
          </>
        )}
      </>
    );
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
        await firebaseSignOut(firebaseClientAuth);
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
              const hrefAttr = e.currentTarget.getAttribute('href');
              if (typeof window !== 'undefined' && window.location.pathname === '/' && hrefAttr && hrefAttr.startsWith('/#')) {
                 e.preventDefault();
                 const targetId = hrefAttr.substring(hrefAttr.indexOf('#') + 1);
                 document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                 window.history.pushState(null, '', hrefAttr);
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 items-center">
            {staticNavItems.map((item) => (
              <NavLink key={`desktop-nav-${item.id}`} href={item.href} iconName={item.iconName} className="px-3">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Admin/Login Button - visible on all sizes for now */}
            <div className="hidden md:flex"> {/* Keep separate div for potential future layout adjustments if needed */}
              {isAuthenticated ? (
                <NavLink
                  key={`admin-panel-link-desktop-${isAuthenticated.toString()}-${currentUser?.uid}`}
                  href={adminNavItemData.href}
                  iconName={adminNavItemData.iconName}
                  className="px-3"
                >
                  {adminNavItemData.label}
                </NavLink>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginDialogOpen(true)} disabled={isSubmittingLogin}>
                  {isSubmittingLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Giriş Yap
                </Button>
              )}
            </div>

            {/* Mobile Hamburger Menu - only on small screens */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Menüyü Aç">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-card p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                     <SheetTitle asChild>
                        <Link
                          href="/#anasayfa-section"
                          className="text-xl font-headline font-bold text-gradient"
                           onClick={(e) => {
                              setIsMobileMenuOpen(false);
                              const hrefAttr = e.currentTarget.getAttribute('href');
                               if (typeof window !== 'undefined' && window.location.pathname === '/' && hrefAttr && hrefAttr.startsWith('/#')) {
                                  e.preventDefault();
                                  const targetId = hrefAttr.substring(hrefAttr.indexOf('#') + 1);
                                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                                  window.history.pushState(null, '', hrefAttr);
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
                       <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary">
                          <XIcon className="h-5 w-5" /> {/* XIcon kullanıldı */}
                          <span className="sr-only">Kapat</span>
                      </SheetClose>
                  </SheetHeader>
                  <nav className="flex-grow flex flex-col space-y-1 p-3 overflow-y-auto">
                    {renderNavItemsForSheet()}
                    {!isAuthenticated && ( // Giriş yapılmamışsa mobil menüde de Giriş Yap butonu olsun
                       <SheetClose asChild>
                          <Button variant="default" onClick={() => { setIsLoginDialogOpen(true); setIsMobileMenuOpen(false); }} className="text-base py-2.5 px-4 justify-start w-full mt-2" disabled={isSubmittingLogin}>
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
