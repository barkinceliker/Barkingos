
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Briefcase, Home, User, BookOpen, Code, BarChart, MessageSquare, Settings, FileText, Shield, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { label: 'Anasayfa', href: '/', icon: Home },
  { label: 'Hakkımda', href: '/hakkimda', icon: User },
  { label: 'Portföy', href: '/portfoy', icon: Briefcase },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Projeler', href: '/projeler', icon: Code },
  { label: 'Yetenekler', href: '/yetenekler', icon: BarChart },
  { label: 'Deneyim', href: '/deneyim', icon: Briefcase },
  { label: 'İletişim', href: '/iletisim', icon: MessageSquare },
  { label: 'Hizmetler', href: '/hizmetler', icon: Settings },
  { label: 'CV / Özgeçmiş', href: '/resume', icon: FileText },
];

const adminNavItem = { label: 'Admin Panel', href: '/admin', icon: Shield };

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the login cookie
      document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      // Redirect to login page
      window.location.href = '/login'; // Full page redirect
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally, show a toast error
    }
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <Link href={href} passHref>
      <Button variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className)} onClick={onClick}>
        {children}
      </Button>
    </Link>
  );
  
  if (!isMounted) {
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="text-2xl font-headline font-bold text-primary">
            BenimSitem
          </Link>
          <div className="md:hidden">
             <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          BenimSitem
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1 items-center flex-wrap">
          {mainNavItems.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {currentUser ? (
            <>
              <NavLink key={adminNavItem.label} href={adminNavItem.href}>
                 {adminNavItem.label}
              </NavLink>
              <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                <LogOut className="mr-2 h-5 w-5" /> Çıkış Yap
              </Button>
            </>
          ) : (
            <NavLink key="login-desktop-nav" href="/login">
              <LogIn className="mr-2 h-5 w-5" /> Giriş Yap
            </NavLink>
          )}
        </nav>
        
        {/* Mobile Navigation */}
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
                {mainNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SheetClose asChild key={item.label}>
                      <NavLink href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  );
                })}
                {currentUser ? (
                  <>
                    <SheetClose asChild key={adminNavItem.label}>
                        <NavLink href={adminNavItem.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                          <adminNavItem.icon className="mr-3 h-5 w-5" />
                          {adminNavItem.label}
                        </NavLink>
                    </SheetClose>
                     <SheetClose asChild key="logout-mobile-nav">
                        <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start text-base">
                            <LogOut className="mr-3 h-5 w-5" /> Çıkış Yap
                        </Button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild key="login-mobile-nav">
                     <NavLink href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                        <LogIn className="mr-3 h-5 w-5" />
                        Giriş Yap
                      </NavLink>
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
