
// Bu sayfanın içeriği artık /src/app/admin/manage-settings/theme/_components/ThemeSettingsFormCard.tsx
// bileşenine taşındı ve /src/app/admin/page.tsx içinde kullanılıyor.
// Bu dosya doğrudan bir sayfa olarak kullanılmayacak, ancak bileşenin kaynağı olarak kalabilir
// veya daha merkezi bir bileşen yapısına taşınabilir.
// Şimdilik, kullanıcı doğrudan bu URL'ye gelirse bir yönlendirme veya bilgilendirme eklenebilir.

import ThemeSettingsFormCard from "./_components/ThemeSettingsFormCard";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThemeSettingsPageStandalone() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Tema Ayarları (Eski Sayfa)</CardTitle>
          <CardDescription>
            Bu bölümdeki tema ayarları artık ana yönetim panelindeki "Site Tema Ayarları" akordeon bölümünden yönetilmektedir.
          </CardDescription>
        </CardHeader>
      </Card>
      <ThemeSettingsFormCard />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
