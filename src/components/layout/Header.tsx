
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, User, BookOpen, Code as CodeIcon, BarChart, MessageSquare, Settings, FileText, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
// import { useToast } from "@/hooks/use-toast"; // Toast not used directly for login anymore

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
  const router = useRouter();
  // const { toast } = useToast(); // Not directly used now

  const NavLink = ({ href, children, onClick, className, disabled }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string, disabled?: boolean }) => (
    <Button asChild variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className, disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
  
  // Admin nav item is always enabled in appearance, actual access control is via middleware
  const mobileNavItems = [...mainNavItemsBase, { ...adminNavItem }]; 

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
          {/* Login/Logout UI Removed */}
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
                          // if (item.disabled) return; // Disabled logic removed
                          setIsMobileMenuOpen(false)
                        }} 
                        className="text-base"
                        // disabled={item.disabled} // Disabled logic removed
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  );
                })}
                {/* Login/Logout UI Removed for mobile */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
