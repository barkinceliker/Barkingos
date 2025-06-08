
import CustomThemesTableCardObsolete from "./_components/CustomThemesTableCard";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Palette, AlertTriangle } from "lucide-react";

export default function CustomThemesPageStandaloneObsolete() {
  return (
    <div className="space-y-8 p-4 md:p-8">
       <section className="flex items-start space-x-3">
        <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
            <Palette className="mr-3 h-8 w-8" /> Özel Tema Yönetimi (Artık Kullanılmıyor)
          </h1>
          <p className="text-muted-foreground mt-2">
              Bu bölümdeki özel tema yönetimi kaldırılmıştır. Tema seçimi ana yönetim panelindeki "Temalar" akordeon bölümünden yapılmaktadır.
              Yeni özel tema ekleme ve düzenleme sayfaları da artık işlevsel değildir.
          </p>
        </div>
      </section>
      <CustomThemesTableCardObsolete />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
