
"use client";

import LinkFromNext from 'next/link'; // Renamed to avoid conflict with internal Link variable
import React, { useState, useEffect, useCallback } from 'react';
import { Menu as MenuIcon, Loader2, LogIn, Shield, MoreVertical, X, ChevronDown, FileText, BookOpenText, User, Home, Award, Lightbulb, Briefcase, Sparkles, MessageSquare, LogOut as LogOutIcon } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface NavLinkProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  disabled?: boolean;
  iconName?: string;
  isAction?: boolean;
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
      setIsMobileMenuOpen(false);
      router.refresh();
    } catch (error) {
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingLogout(false);
    }
  };


  const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick, className, disabled, iconName, isAction }) => {
    const IconComponent = getLucideIcon(iconName);
    const currentPathname = usePathname();
    const [isActiveClient, setIsActiveClient] = useState(false);
  
    const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => {
      let eventDefaultPrevented = false;
      if (href && href.startsWith('/#')) {
        const targetId = href.substring(href.indexOf('#') + 1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          if (typeof e.preventDefault === 'function') {
            e.preventDefault();
            eventDefaultPrevented = true;
          }
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.history.pushState) {
            if (currentPathname === '/') {
              window.history.pushState(null, '', href);
            } else {
               // If on a different page, let Next.js handle navigation to the root then scroll.
               // Or, just navigate to the root page with hash.
               router.push(href);
            }
          } else {
            window.location.hash = href.substring(1); 
          }
        }
      }
  
      if (onClick) {
        onClick(e);
      }
    }, [href, currentPathname, router, onClick]);
  
    useEffect(() => {
      if (typeof window !== 'undefined' && href) {
        const checkActivity = () => {
          let currentActivity = false;
          if (href.startsWith('/#')) {
            if (currentPathname === '/') {
              const hash = window.location.hash;
              const targetHash = href.substring(href.indexOf('#'));
              if (href === '/#anasayfa-section') {
                currentActivity = !hash || hash === '' || hash === targetHash;
              } else {
                currentActivity = hash === targetHash;
              }
            } else {
              currentActivity = false;
            }
          } else {
            currentActivity = currentPathname === href;
          }
          if (isActiveClient !== currentActivity) {
            setIsActiveClient(currentActivity);
          }
        };
  
        checkActivity();
        const handleHashChange = () => checkActivity();
        const handlePopState = () => checkActivity();
  
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('popstate', handlePopState); 
  
        return () => {
          window.removeEventListener('hashchange', handleHashChange);
          window.removeEventListener('popstate', handlePopState);
        };
      }
    }, [href, currentPathname, isActiveClient]);
  
    const commonClasses = cn(
      "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
      "justify-start py-2 rounded-md",
      isActiveClient && !isAction && "bg-accent/20 text-accent-foreground font-semibold",
      className,
      disabled && "opacity-50 cursor-not-allowed"
    );
  
    if (isAction) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className={cn(commonClasses, "gap-0")} // Ensure gap-0 for action buttons too
          disabled={disabled}
        >
          {IconComponent && <IconComponent className={cn("h-4 w-4")} />}
          <span>{children}</span>
        </Button>
      );
    }
  
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(commonClasses, "lg:text-xs xl:text-sm", "gap-0")} // Added gap-0 for NavLink Button
        disabled={disabled}
      >
        <LinkFromNext href={href || '#'} onClick={handleLinkClick}>
          {IconComponent && <IconComponent className={cn("h-4 w-4")} />} {/* Removed mr-2 */}
          <span>{children}</span>
        </LinkFromNext>
      </Button>
    );
  };
  

  const renderNavItemsForSheet = () => {
    return (
      <>
        {staticNavItems.map((item) => (
          <SheetClose asChild key={`sheet-nav-${item.id}`}>
            <NavLink href={item.href} iconName={item.iconName} className="text-base py-2.5 px-4 w-full gap-0">
              {item.label}
            </NavLink>
          </SheetClose>
        ))}
        {isAuthenticated && (
          <>
            <div className="my-2 border-t border-border" />
            <SheetClose asChild>
              <NavLink href={adminNavItemData.href} iconName={adminNavItemData.iconName} className="text-base py-2.5 px-4 w-full gap-0">
                {adminNavItemData.label}
              </NavLink>
            </SheetClose>
          </>
        )}
        <div className="my-2 border-t border-border" />
        {isAuthenticated ? (
           <SheetClose asChild>
             <Button variant="ghost" onClick={handleLogout} className="text-base py-2.5 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive justify-start w-full gap-0" disabled={isSubmittingLogout}>
               {isSubmittingLogout ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOutIcon className="h-5 w-5" />}
               <span className="ml-0"> {logoutNavItemData.label}</span>
             </Button>
           </SheetClose>
        ) : (
           <SheetClose asChild>
              <Button variant="default" onClick={() => { setIsLoginDialogOpen(true); setIsMobileMenuOpen(false); }} className="text-base py-2.5 px-4 justify-start w-full mt-2 gap-0" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                <span className="ml-0"> Giriş Yap</span>
              </Button>
            </SheetClose>
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
          <LinkFromNext
            href="/#anasayfa-section"
            className="text-2xl font-headline font-bold text-gradient"
            onClick={(e) => {
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
              } else {
                router.push('/#anasayfa-section');
              }
            }}
            key={`site-title-${siteTitle}`}
          >
            {siteTitle}
          </LinkFromNext>

          <nav className="hidden lg:flex space-x-1 items-center">
            {staticNavItems.map((item) => (
              <NavLink key={`desktop-nav-${item.id}`} href={item.href} iconName={item.iconName} className="px-3">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
             <div className="hidden lg:flex items-center">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-3 lg:text-xs xl:text-sm">
                      <Shield className="h-4 w-4" />
                      <span className="ml-2">{adminNavItemData.label}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild className="gap-0">
                      <LinkFromNext href={adminNavItemData.href} className="cursor-pointer w-full flex items-center">
                        <Shield className="h-4 w-4" />
                        <span className="ml-2">Admin Paneline Git</span>
                      </LinkFromNext>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isSubmittingLogout}
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer gap-0 flex items-center"
                    >
                      {isSubmittingLogout ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOutIcon className="h-4 w-4" />}
                      <span className="ml-2">Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginDialogOpen(true)} disabled={isSubmittingLogin} className="lg:text-xs xl:text-sm gap-0">
                  {isSubmittingLogin ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  <span className="ml-0"> Giriş Yap</span>
                </Button>
              )}
            </div>


            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Menüyü Aç">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-card p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                     <SheetTitle asChild>
                        <LinkFromNext
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
                              } else {
                                router.push('/#anasayfa-section');
                              }
                          }}
                          key={`site-title-mobile-${siteTitle}`}
                        >
                          {siteTitle}
                        </LinkFromNext>
                      </SheetTitle>
                       <SheetClose>
                          <X className="h-5 w-5" />
                          <span className="sr-only">Kapat</span>
                      </SheetClose>
                  </SheetHeader>
                  <nav className="flex-grow flex flex-col space-y-1 p-3 overflow-y-auto">
                    {renderNavItemsForSheet()}
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
