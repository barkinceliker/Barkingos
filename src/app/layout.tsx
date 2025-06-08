
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
// import { checkAuthStatus } from '@/lib/actions/auth'; // Removed as admin panel is gone
import { getSiteGeneralSettings } from '@/lib/actions/settings-actions';
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

const staticMetadataDescription = 'Personal portfolio, blog, services, projects, and more, all in one place.';

export async function generateMetadata(): Promise<Metadata> {
  const logPrefix = "[RootLayout generateMetadata] SERVER:";
  console.log(`${logPrefix} Fetching general settings for site title...`);
  const siteSettings = await getSiteGeneralSettings();
  const title = siteSettings?.siteTitle || 'Barkin Celiker | Portfolio & Blog';
  console.log(`${logPrefix} Generated title: '${title}'`);
  return {
    title: title,
    description: staticMetadataDescription,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logPrefix = "[RootLayout SERVER]";
  console.log(`${logPrefix} ================== START ==================`);
  
  const fontVariableClasses = cn(ptSans.variable, playfairDisplay.variable, sourceCodePro.variable);
  console.log(`${logPrefix} Font variable classes for HTML: '${fontVariableClasses}'`);
  
  const finalHtmlClasses = cn(fontVariableClasses).trim(); 

  console.log(`${logPrefix} className to be applied to <html> tag: '${finalHtmlClasses}'`);
  console.log(`${logPrefix} ==================== END ====================`);

  const siteSettings = await getSiteGeneralSettings();

  return (
    <html lang="en" className={finalHtmlClasses}>
      <head />
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <Header
          initialSiteTitle={siteSettings.siteTitle}
        />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
