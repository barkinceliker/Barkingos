
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { checkAuthStatus } from '@/lib/actions/auth';
import { getSiteGeneralSettings } from '@/lib/actions/settings-actions'; // getThemeSetting removed
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
  const logPrefix = "[RootLayout generateMetadata] SUNUCU:";
  console.log(`${logPrefix} Site başlığı için genel ayarlar çekiliyor...`);
  const siteSettings = await getSiteGeneralSettings();
  const title = siteSettings?.siteTitle || 'BenimSitem | Portfolyo ve Blog';
  console.log(`${logPrefix} Oluşturulan başlık: '${title}'`);
  return {
    title: title,
    description: staticMetadataDescription,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

async function AuthAwareUIComponents() {
  const logPrefix = "[RootLayout AuthAwareUIComponents] SUNUCU:";
  console.log(`${logPrefix} Kimlik doğrulama ve site ayarları çekiliyor...`);
  const auth = await checkAuthStatus();
  const siteSettings = await getSiteGeneralSettings();
  console.log(`${logPrefix} Kimlik durumu: ${auth.isAuthenticated}, Site Başlığı: ${siteSettings.siteTitle}`);
  return (
    <>
      <Header
        key={`header-${auth.isAuthenticated.toString()}-${siteSettings.siteTitle}`}
        initialIsAuthenticated={auth.isAuthenticated}
        initialSiteTitle={siteSettings.siteTitle}
      />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logPrefix = "[RootLayout SUNUCU]";
  console.log(`${logPrefix} ================== BAŞLANGIÇ ==================`);
  
  // Tema ayarları kaldırıldığı için getThemeSetting çağrısı ve ilgili mantık kaldırıldı.
  // Artık tema doğrudan globals.css ile :root üzerinden yönetiliyor.

  const fontVariableClasses = cn(ptSans.variable, playfairDisplay.variable, sourceCodePro.variable);
  console.log(`${logPrefix} HTML için font değişken sınıfları: '${fontVariableClasses}'`);
  
  // HTML sınıfına tema sınıfı ekleme mantığı kaldırıldı.
  const finalHtmlClasses = cn(fontVariableClasses).trim(); 
  const htmlKey = `${fontVariableClasses}`; // Key de basitleştirildi.

  console.log(`${logPrefix} <html> etiketine uygulanacak className: '${finalHtmlClasses}'`);
  console.log(`${logPrefix} <html> etiketine uygulanacak key: '${htmlKey}'`);
  console.log(`${logPrefix} ==================== BİTİŞ ====================`);

  return (
    <html lang="tr" className={finalHtmlClasses} key={htmlKey}>
      <head />
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
