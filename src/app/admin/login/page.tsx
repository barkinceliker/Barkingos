
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Girişi</CardTitle>
          <CardDescription>Giriş yapmak için lütfen navigasyon barındaki "Giriş Yap" butonunu kullanın.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Bu sayfa artık aktif olarak kullanılmamaktadır. Admin paneline erişim için
            sağ üst köşedeki menüden giriş yapabilirsiniz.
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

    