
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-gradient">Admin Erişimi</CardTitle>
          <CardDescription>
            Admin paneline erişim için lütfen sayfanın üst kısmındaki "Giriş Yap" butonunu kullanın.
            Bu sayfa, yetkisiz erişim denemelerinde veya doğrudan yönlendirmelerde gösterilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Eğer giriş yapmakta sorun yaşıyorsanız, lütfen site yöneticisi ile iletişime geçin.
          </p>
          <div className="mt-6 text-center">
            <Link href="/" className="text-primary hover:underline">
              Anasayfaya Dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
