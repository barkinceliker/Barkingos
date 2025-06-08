
// Bu sayfanın içeriği artık /src/app/admin/manage-settings/custom-themes/_components/CustomThemesTableCard.tsx
// bileşenine taşındı ve /src/app/admin/page.tsx içinde kullanılıyor.
// Bu dosya doğrudan bir sayfa olarak kullanılmayacak.

import CustomThemesTableCard from "./_components/CustomThemesTableCard";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export default function CustomThemesPageStandalone() {
  return (
    <div className="space-y-8">
       <section>
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <Palette className="mr-3 h-8 w-8" /> Özel Tema Yönetimi (Eski Sayfa)
        </h1>
        <p className="text-muted-foreground">
            Bu bölümdeki özel tema yönetimi artık ana yönetim panelindeki "Özel Tema Yönetimi" akordeon bölümünden yönetilmektedir.
            Yeni tema ekleme ve düzenleme sayfalarına oradan erişebilirsiniz.
        </p>
      </section>
      <CustomThemesTableCard />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
