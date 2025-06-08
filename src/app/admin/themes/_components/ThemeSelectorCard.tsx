
"use client";

// This component is no longer used as theme selection has been removed from the admin panel.
// The site now uses a fixed CSS-defined theme.

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThemeSelectorCardObsolete() {
  return (
    <Card className="shadow-xl opacity-75">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-destructive flex items-center">
          <AlertTriangle className="mr-3 h-6 w-6" /> Tema Seçimi Devre Dışı
        </CardTitle>
        <CardDescription>
          Bu bölüm artık kullanılmamaktadır. Site teması artık doğrudan CSS ile yönetilmektedir.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-10">
        <Palette size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-6">
          Tema yönetimi özelliği kaldırılmıştır. Site sabit bir koyu tema kullanmaktadır.
        </p>
        <Link href="/admin">
            <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
