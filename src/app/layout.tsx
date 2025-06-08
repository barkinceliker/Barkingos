
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import FloatingLogoutButton from '@/components/layout/FloatingLogoutButton';
import { checkAuthStatus } from '@/lib/actions/auth';
import { getThemeSetting, type ThemeName } from '@/lib/actions/settings-actions';
import { cn } from '@/lib/utils';
import { PT_Sans, Playfair_Display, Source_Code_Pro } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-source-code-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BenimSitem | Tek Sayfa Portfolyo ve Blog',
  description: 'Kişisel portfolyo, blog, hizmetler, projeler ve daha fazlası tek bir sayfada.',
  icons: {
    icon: '/favicon.ico',
  },
};

async function AuthAwareUIComponents() {
  const auth = await checkAuthStatus();
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
    <html lang="tr" className={cn(themeClass, ptSans.variable, playfairDisplay.variable, sourceCodePro.variable)}>
      <head>
        {/* next/font kullandığımız için Google Fonts linkleri kaldırıldı */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <AuthAwareUIComponents />
        {/* Ana layout'ta container ve padding'i kaldırıyoruz, çünkü page.tsx kendi container'ını yönetecek */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

    