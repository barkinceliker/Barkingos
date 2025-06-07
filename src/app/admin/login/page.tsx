
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Admin Alanı</CardTitle>
          <CardDescription>Giriş sistemi şu anda devre dışı bırakılmıştır.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Admin paneline erişmek için ek bir giriş yapmanız gerekmemektedir.
            İlgili admin sayfalarına doğrudan navigasyon menüsünden ulaşabilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
