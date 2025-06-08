
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
  console.log("[RootLayout generateMetadata] SUNUCU: Site başlığı için genel ayarlar çekiliyor...");
  const siteSettings = await getSiteGeneralSettings();
  const title = siteSettings?.siteTitle || 'BenimSitem | Portfolyo ve Blog';
  console.log(`[RootLayout generateMetadata] SUNUCU: Oluşturulan başlık: '${title}'`);
  return {
    title: title,
    description: staticMetadataDescription, 
    icons: {
      icon: '/favicon.ico', 
    },
  };
}

async function AuthAwareUIComponents() {
  console.log("[RootLayout AuthAwareUIComponents] SUNUCU: Kimlik doğrulama ve site ayarları çekiliyor...");
  const auth = await checkAuthStatus();
  const siteSettings = await getSiteGeneralSettings(); 
  console.log(`[RootLayout AuthAwareUIComponents] SUNUCU: Kimlik durumu: ${auth.isAuthenticated}, Site Başlığı: ${siteSettings.siteTitle}`);
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
  console.log("[RootLayout SERVER RENDER] ================== BAŞLANGIÇ ==================");
  
  const themeSetting = await getThemeSetting(); // Bu fonksiyon zaten cache'li
  const activeTheme = themeSetting?.activeTheme || 'default';
  
  console.log(`[RootLayout SERVER RENDER] getThemeSetting() çağrıldı. Sonuç (veritabanı/cache):`, JSON.stringify(themeSetting));
  console.log(`[RootLayout SERVER RENDER] Sunucuda render için kullanılacak aktif tema: '${activeTheme}'`);
  
  const themeClass = activeTheme === 'default' ? '' : `theme-${activeTheme}`;
  console.log(`[RootLayout SERVER RENDER] HTML için hesaplanan tema sınıfı: '${themeClass}'`);

  const fontVariableClasses = cn(ptSans.variable, playfairDisplay.variable, sourceCodePro.variable);
  console.log(`[RootLayout SERVER RENDER] HTML için font değişken sınıfları: '${fontVariableClasses}'`);
  
  // `key` prop'u için en önemli olan temanın değişmesi. Font sınıfları genellikle sabit kalır.
  // Bu yüzden `activeTheme`'i `key`'e dahil etmek yeterli ve daha nettir.
  const finalHtmlClasses = cn(themeClass, fontVariableClasses).trim();
  const htmlKey = `${activeTheme}-${fontVariableClasses}`; // Key'i tema ve fontlara bağlı yapalım

  console.log(`[RootLayout SERVER RENDER] <html> etiketine uygulanacak className: '${finalHtmlClasses}'`);
  console.log(`[RootLayout SERVER RENDER] <html> etiketine uygulanacak key: '${htmlKey}'`);
  console.log("[RootLayout SERVER RENDER] ==================== BİTİŞ ====================");

  return (
    <html lang="tr" className={finalHtmlClasses} key={htmlKey}>
      <head>
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
    

    