
"use client";

import LinkFromNext from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { Menu as MenuIcon, Loader2, X, ChevronDown, FileText, BookOpenText, User, Home, Award, Lightbulb, Briefcase, Sparkles, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
// Dialog, DropdownMenu and related imports removed as login/admin features are gone
import { cn } from '@/lib/utils';
// Toast, Firebase auth imports removed
import { useRouter, usePathname } from 'next/navigation';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

const staticNavItems = [
  { id: 'about', label: 'About Me', href: '/#hakkimda-section', iconName: 'User' },
  { id: 'services', label: 'Services', href: '/#hizmetler-section', iconName: 'Sparkles' },
  { id: 'projects', label: 'Projects', href: '/#projeler-section', iconName: 'Briefcase' },
  { id: 'skills', label: 'Skills', href: '/#yetenekler-section', iconName: 'Lightbulb' },
  { id: 'experience', label: 'Experience', href: '/#deneyim-section', iconName: 'Award' },
  { id: 'resume', label: 'Resume', href: '/#ozgecmis-section', iconName: 'FileText' },
  { id: 'blog', label: 'Blog', href: '/#blog-section', iconName: 'BookOpenText' },
  { id: 'contact', label: 'Contact', href: '/#iletisim-section', iconName: 'MessageSquare' },
];

// Admin and logout nav items removed

interface HeaderProps {
  initialSiteTitle: string;
}

interface NavLinkProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  disabled?: boolean;
  iconName?: string;
  isAction?: boolean; // Kept for consistency if ever needed, but not used for admin actions now
}

export default function Header({ initialSiteTitle }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState(initialSiteTitle);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSiteTitle(initialSiteTitle);
  }, [initialSiteTitle]);

  const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick, className, disabled, iconName, isAction }) => {
    const IconComponent = getLucideIcon(iconName);
    const currentPathnameFromHook = usePathname();
    const [isActiveClient, setIsActiveClient] = useState(false);

    useEffect(() => {
      const handleActivityUpdate = () => {
        if (typeof window === 'undefined' || !href) {
          setIsActiveClient(prev => !prev ? prev : false); 
          return;
        }

        let calculatedIsActive = false;
        const currentHash = window.location.hash;
        const currentWindowPathname = window.location.pathname;

        if (href.startsWith('/#') && (currentWindowPathname === '/' || currentWindowPathname === '')) {
          const targetHash = href.substring(href.indexOf('#'));
          calculatedIsActive = currentHash === targetHash;
          if (href === '/#anasayfa-section' && (currentHash === '' || currentHash === '#')) {
            calculatedIsActive = true;
          }
        } else if (!href.startsWith('/#')) {
          calculatedIsActive = currentPathnameFromHook === href;
        }
        setIsActiveClient(prev => prev === calculatedIsActive ? prev : calculatedIsActive);
      };

      handleActivityUpdate();
      window.addEventListener('hashchange', handleActivityUpdate);
      window.addEventListener('popstate', handleActivityUpdate);
      return () => {
        window.removeEventListener('hashchange', handleActivityUpdate);
        window.removeEventListener('popstate', handleActivityUpdate);
      };
    }, [href, currentPathnameFromHook]);


    const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => {
      const currentHref = href || '';
      if (currentHref.startsWith('/#')) {
        const targetId = currentHref.substring(currentHref.indexOf('#') + 1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.location.pathname === '/') {
            window.history.pushState(null, '', currentHref);
          } else {
            router.push(currentHref); 
          }
        }
      }
      if (onClick) {
        onClick(e);
      }
    }, [href, router, onClick]);

    const commonClasses = cn(
      "hover:bg-accent/10",
      "justify-start py-2 rounded-md",
      isActiveClient && !isAction && "bg-accent/20", 
      className,
      disabled && "opacity-50 cursor-not-allowed"
    );
    
    const isServicesLink = href === '/#hizmetler-section';

    if (isAction) { // This block might be unused now as admin actions are removed
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className={cn(commonClasses, isServicesLink ? "text-gradient font-bold" : "text-gradient font-bold" )}
          disabled={disabled}
        >
          {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
          <span>{children}</span>
        </Button>
      );
    }

    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(commonClasses, "text-sm px-3", isServicesLink ? "text-gradient font-bold" : "text-gradient font-bold" )}
        disabled={disabled}
      >
        <LinkFromNext href={href || '#'} onClick={handleLinkClick}>
          {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
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
            <NavLink
              href={item.href}
              iconName={item.iconName}
              className={cn(
                "text-base py-2.5 px-4 w-full font-bold",
                item.href === '/#hizmetler-section' ? "text-gradient" : "text-gradient"
              )}
            >
              {item.label}
            </NavLink>
          </SheetClose>
        ))}
        {/* Admin Login/Logout buttons removed */}
      </>
    );
  };

  return (
    <>
      <header className="bg-navbar-gradient shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <LinkFromNext
            href="/#anasayfa-section"
            className="text-2xl font-headline font-bold text-gradient"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              const hrefAttr = e.currentTarget.getAttribute('href');
               if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '') && hrefAttr && hrefAttr.startsWith('/#')) {
                  e.preventDefault();
                  const targetId = hrefAttr.substring(hrefAttr.indexOf('#') + 1);
                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                  window.history.pushState(null, '', hrefAttr);
              } else {
                router.push('/#anasayfa-section');
              }
            }}
            key={`site-title-${siteTitle}`}
          >
            {siteTitle}
          </LinkFromNext>

          <nav className="hidden lg:flex items-center space-x-0">
            {staticNavItems.map((item) => (
              <NavLink
                key={`desktop-nav-${item.id}`}
                href={item.href}
                iconName={item.iconName}
                className={cn(
                  "text-sm px-3 font-bold", 
                  item.href === '/#hizmetler-section' ? "text-gradient" : "text-gradient"
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Desktop Admin Login/Logout Dropdown removed */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open Menu" className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-navbar-gradient p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b border-border/30 flex flex-row justify-between items-center">
                     <SheetTitle asChild>
                        <LinkFromNext
                          href="/#anasayfa-section"
                          className="text-xl font-headline font-bold text-gradient"
                           onClick={(e) => {
                              setIsMobileMenuOpen(false);
                              const hrefAttr = e.currentTarget.getAttribute('href');
                               if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '') && hrefAttr && hrefAttr.startsWith('/#')) {
                                  e.preventDefault();
                                  const targetId = hrefAttr.substring(hrefAttr.indexOf('#') + 1);
                                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth'});
                                  window.history.pushState(null, '', hrefAttr);
                              } else {
                                router.push('/#anasayfa-section');
                              }
                          }}
                          key={`site-title-mobile-${siteTitle}`}
                        >
                          {siteTitle}
                        </LinkFromNext>
                      </SheetTitle>
                       <SheetClose asChild>
                          <Button variant="ghost" size="icon" aria-label="Close Menu" className="text-foreground hover:bg-accent/10 hover:text-accent-foreground">
                            <X className="h-5 w-5" />
                          </Button>
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
      {/* Login Dialog removed */}
    </>
  );
}
