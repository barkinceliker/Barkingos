"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { List, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import type { User as FirebaseUserType } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

// Bu değerler Header.tsx'den kopyalandı. İdealde ortak bir yerden alınabilirler.
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

interface FloatingNavButtonProps {
  initialIsAuthenticated: boolean;
  siteTitle: string;
}

export default function FloatingNavButton({ initialIsAuthenticated, siteTitle }: FloatingNavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const NavLink = ({ href, children, iconName }: { href: string; children: React.ReactNode; iconName?: string }) => {
    const IconComponent = getLucideIcon(iconName);
    const [isHashActive, setIsHashActive] = useState(false);

    useEffect(() => {
      const checkHash = () => {
        if (href.startsWith('/#') && pathname === '/') {
          setIsHashActive(window.location.hash === href.substring(1));
        } else {
          setIsHashActive(false);
        }
      };
      if (typeof window !== 'undefined') {
        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
      }
    }, [href, pathname]);

    const isActive =
      (pathname === '/' && href === '/#anasayfa-section' && !window.location.hash) || // Anasayfa ve hash yok
      (href.startsWith('/#') && pathname === '/' && isHashActive) || // Hash linkler ve aktif hash
      (pathname === href && !href.startsWith('/#')); // Direkt sayfa linkleri

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      setIsOpen(false); 
      if (href.startsWith('/#') && typeof window !== 'undefined') {
        const targetId = href.substring(href.indexOf('#') + 1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.history.pushState) {
            // Sadece hash'i güncelle, tam yolu değil, eğer ana sayfadaysak
            const newHash = href.substring(href.indexOf('#'));
            window.history.pushState(null, '', newHash);
          } else {
            window.location.hash = href.substring(href.indexOf('#'));
          }
        }
      }
    };

    return (
      <SheetClose asChild>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            "text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start text-base py-3 px-4",
            isActive && "bg-accent/10 text-accent-foreground font-semibold"
          )}
        >
          <Link href={href} onClick={handleLinkClick}>
            {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
            {children}
          </Link>
        </Button>
      </SheetClose>
    );
  };

  return (
    <div className="fixed bottom-20 right-6 z-[90] md:block hidden"> {/* md ve üzeri ekranlarda göster, küçüklerde gizle */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="shadow-xl rounded-full p-3 bg-card hover:bg-accent/20 border-primary/50 aspect-square"
            aria-label="Navigasyon Menüsünü Aç"
          >
            <List className="h-6 w-6 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-card p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle asChild>
              <Link
                href="/#anasayfa-section"
                className="text-xl font-headline font-bold text-gradient"
                onClick={(e) => {
                    setIsOpen(false);
                    if (typeof window !== 'undefined' && window.location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById('anasayfa-section')?.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', '/#anasayfa-section');
                    }
                }}
              >
                {siteTitle || "Menü"}
              </Link>
            </SheetTitle>
            {/* SheetClose bileşenini header'a eklemeye gerek yok, çünkü içerik tıklandığında kapanıyor. 
                Ancak manuel kapatma için bir X butonu isterseniz eklenebilir. */}
             <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary">
                <X className="h-5 w-5" />
                <span className="sr-only">Kapat</span>
            </SheetClose>
          </SheetHeader>
          <nav className="flex-grow flex flex-col space-y-1 p-3 overflow-y-auto">
            {staticNavItems.map((item) => (
              <NavLink
                key={`floating-nav-${item.id}`}
                href={item.href}
                iconName={item.iconName}
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-border" />
                <NavLink
                  key="floating-nav-admin"
                  href={adminNavItemData.href}
                  iconName={adminNavItemData.iconName}
                >
                  {adminNavItemData.label}
                </NavLink>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
