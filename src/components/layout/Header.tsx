
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, User, BookOpen, Code as CodeIcon, BarChart, MessageSquare, Settings, FileText, Shield, Briefcase, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logout, checkAuthStatus } from '@/lib/actions/auth'; // Updated import
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAuthStatus() {
      setIsLoadingAuth(true);
      try {
        const authStatus = await checkAuthStatus();
        console.log("Header: Auth status checked on client:", authStatus);
        setIsAuthenticated(authStatus.isAuthenticated);
      } catch (error) {
        console.error("Header: Error checking auth status", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    fetchAuthStatus();
  }, [pathname]); // Re-check on path change, e.g., after login/logout redirects

  const handleLogout = async () => {
    try {
      await logout(); // This server action handles cookie deletion and redirection
      setIsAuthenticated(false); // Update client-side state
      toast({
        title: "Çıkış Başarılı",
        description: "Giriş sayfasına yönlendirildiniz.",
      });
      // Redirection is handled by the server action, but good to ensure client state is updated.
      // router.push('/admin/login'); // Fallback, normally server action handles redirect
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Çıkış Hatası",
        description: "Çıkış yapılırken bir sorun oluştu.",
        variant: "destructive",
      });
    }
    setIsMobileMenuOpen(false);
  };
  
  const NavLink = ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <Button asChild variant="ghost" className={cn("text-foreground hover:bg-accent/10 hover:text-accent-foreground w-full justify-start md:w-auto", className)} >
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );

  const mobileNavItems = [...mainNavItemsBase, adminNavItem];
  if (isAuthenticated) {
    mobileNavItems.push({ label: 'Çıkış Yap', href: '#', icon: LogOut });
  }


  if (isLoadingAuth && pathname.startsWith('/admin')) {
    // Avoid rendering auth-dependent UI elements while checking status on admin pages
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

        <nav className="hidden md:flex space-x-1 items-center flex-wrap">
          {mainNavItemsBase.map((item) => (
            <NavLink key={`desktop-${item.label}`} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <NavLink key={`desktop-${adminNavItem.label}`} href={adminNavItem.href}>
             <adminNavItem.icon className="mr-2 h-5 w-5" /> {adminNavItem.label}
          </NavLink>
          {isAuthenticated && (
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
                {mobileNavItems.map((item) => {
                  const IconComponent = item.icon;
                  if (item.label === 'Çıkış Yap') {
                    return (
                       <SheetClose asChild key={`mobile-${item.label}`}>
                        <Button variant="ghost" onClick={handleLogout} className="text-base w-full justify-start text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                          <IconComponent className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      </SheetClose>
                    );
                  }
                  return (
                    <SheetClose asChild key={`mobile-${item.label}`}>
                      <NavLink href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-base">
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
