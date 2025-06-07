
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, User, BookOpen, Code as CodeIcon, BarChart, MessageSquare, Settings, FileText, Shield, LogOut, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClientMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Header: onAuthStateChanged triggered. Firebase user:", user ? user.email : 'null');
      setCurrentUser(user);
      
      // Synchronize cookie with Firebase auth state
      if (user) {
        if (!document.cookie.includes('isLoggedIn=true')) {
          console.log("Header: Firebase user detected, but 'isLoggedIn' cookie missing. Setting cookie.");
          const expires = new Date();
          expires.setTime(expires.getTime() + (60 * 60 * 1000)); // 1 hour
          document.cookie = `isLoggedIn=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        }
      } else {
        if (document.cookie.includes('isLoggedIn=true')) {
          console.log("Header: No Firebase user, but 'isLoggedIn' cookie present. Clearing cookie.");
          document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    console.log("Header: handleLogout called.");
    try {
      await signOut(auth);
      console.log("Header: Firebase signOut successful.");
      // Clear the cookie
      document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      console.log("Header: 'isLoggedIn' cookie cleared.");
      setCurrentUser(null); // Ensure local state is updated immediately
      router.push('/'); // Redirect to homepage or login
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Header: Error signing out:", error);
    }
  };
  
  const NavLink = ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <Button asChild variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className)} >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );

  const allNavItems = [...mainNavItemsBase, adminNavItem];

  if (!isClientMounted) {
    // Basic header skeleton for SSR/initial mount to avoid layout shifts and hydration errors
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
          <nav className="hidden md:flex space-x-1 items-center flex-wrap">
            {/* Render placeholder links or nothing to avoid hydration issues with dynamic content */}
          </nav>
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

        <nav className="hidden md:flex space-x-1 items-center flex-wrap">
          {mainNavItemsBase.map((item) => (
            <NavLink key={`desktop-${item.label}`} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <NavLink key={`desktop-${adminNavItem.label}`} href={adminNavItem.href}>
            <adminNavItem.icon className="mr-2 h-5 w-5" /> {adminNavItem.label}
          </NavLink>
          {currentUser && (
            <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
              <LogOut className="mr-2 h-5 w-5" /> Çıkış Yap
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
                {allNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SheetClose asChild key={`mobile-${item.label}`}>
                      <NavLink href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  );
                })}
                {currentUser && (
                  <SheetClose asChild>
                    <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start text-base">
                      <LogOut className="mr-3 h-5 w-5" /> Çıkış Yap
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
