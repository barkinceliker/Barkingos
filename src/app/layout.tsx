
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import FloatingLogoutButton from '@/components/layout/FloatingLogoutButton';
import { checkAuthStatus } from '@/lib/actions/auth';
import { getThemeSetting, type ThemeName, getSiteGeneralSettings } from '@/lib/actions/settings-actions';
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

const staticMetadataDescription = 'Kişisel portfolyo, blog, hizmetler, projeler ve daha fazlası tek bir sayfada.';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteGeneralSettings();
  return {
    title: siteSettings.siteTitle || 'BenimSitem | Portfolyo ve Blog',
    description: staticMetadataDescription, // siteSettings.siteDescription kaldırıldı, statik kullanılıyor
    icons: {
      icon: '/favicon.ico', // Varsayılan favicon yolu
    },
  };
}

async function AuthAwareUIComponents() {
  // Bu bileşenin içindeki checkAuthStatus çağrısı sunucu tarafında çalışır.
  const auth = await checkAuthStatus();
  const siteSettings = await getSiteGeneralSettings(); // Site başlığı için
  return (
    <>
      <Header
        key={`header-${auth.isAuthenticated.toString()}-${siteSettings.siteTitle}`}
        initialIsAuthenticated={auth.isAuthenticated}
        initialSiteTitle={siteSettings.siteTitle}
      />
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
  // SUNUCU TARAFI LOG: Bu log, her sayfa isteğinde veya revalidate sonrası sunucuda görünecektir.
  console.log(`[RootLayout SERVER RENDER] Aktif Tema Veritabanından: '${themeSetting.activeTheme}'`);
  
  const themeClass = themeSetting.activeTheme === 'default' ? '' : `theme-${themeSetting.activeTheme}`;
  const fontVariableClasses = cn(ptSans.variable, playfairDisplay.variable, sourceCodePro.variable);
  
  console.log(`[RootLayout SERVER RENDER] Uygulanacak HTML Sınıfı (themeClass): '${themeClass}'`);
  console.log(`[RootLayout SERVER RENDER] Uygulanacak HTML Sınıfı (fontVariableClasses): '${fontVariableClasses}'`);
  const finalHtmlClasses = cn(themeClass, fontVariableClasses);
  console.log(`[RootLayout SERVER RENDER] Nihai HTML Sınıfları: '${finalHtmlClasses}'`);


  return (
    <html lang="tr" className={finalHtmlClasses}>
      <head>
        {/* Favicon linkleri generateMetadata içinde yönetiliyor */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <AuthAwareUIComponents />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
