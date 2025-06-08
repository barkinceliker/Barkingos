
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import FloatingLogoutButton from '@/components/layout/FloatingLogoutButton';
import { checkAuthStatus } from '@/lib/actions/auth';
import { getThemeSetting, type ThemeName } from '@/lib/actions/settings-actions'; // Import theme actions
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'BenimSitem',
  description: 'Kişisel portfolyo ve blog sitesi',
};

export const dynamic = 'force-dynamic';

async function AuthAwareUIComponents() {
  const auth = await checkAuthStatus();
  console.log("[AuthAwareUIComponents] Auth status from checkAuthStatus:", auth);
  return (
    <>
      <Header key={`header-${auth.isAuthenticated.toString()}`} initialIsAuthenticated={auth.isAuthenticated} />
      <FloatingLogoutButton key={`logout-btn-${auth.isAuthenticated.toString()}`} initialIsAuthenticated={auth.isAuthenticated} />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeSetting = await getThemeSetting();
  const themeClass = themeSetting.activeTheme === 'default' ? '' : `theme-${themeSetting.activeTheme}`;

  return (
    <html lang="tr" className={cn(themeClass)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthAwareUIComponents />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
