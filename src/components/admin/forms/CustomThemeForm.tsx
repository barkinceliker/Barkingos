
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Palette } from "lucide-react";
import Link from "next/link";

export default function CustomThemeFormObsolete() {

  return (
      <Card className="shadow-xl opacity-75 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <AlertTriangle className="mr-3 h-7 w-7 text-destructive" />
            Özel Tema Formu (Devre Dışı)
          </CardTitle>
          <CardDescription>
            Bu form, özel tema oluşturma/düzenleme özelliği kaldırıldığı için artık kullanılmamaktadır.
            Tema seçimi ana admin panelindeki "Temalar" bölümünden, önceden tanımlanmış seçenekler arasından yapılmaktadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Palette size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            Lütfen sitenizin temasını ana yönetim panelindeki "Temalar" bölümünden seçiniz.
          </p>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin">
              Ana Yönetim Paneline Dön
            </Link>
          </Button>
        </CardContent>
      </Card>
  );
}
