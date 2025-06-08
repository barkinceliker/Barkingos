
"use client";

// This component is no longer used as theme selection has been removed.
// The site now uses a fixed CSS-defined theme.

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function ThemeSettingsDropdownObsolete() {

  return (
    <Card className="shadow-lg opacity-75">
        <CardHeader>
            <CardTitle className="font-headline text-xl text-destructive flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6" /> Site Teması (Devre Dışı)
            </CardTitle>
            <CardDescription className="flex items-start text-sm">
              Bu bölüm artık kullanılmamaktadır. Site teması CSS ile sabitlenmiştir.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[150px] text-center">
          <Palette size={40} className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            Tema seçimi özelliği kaldırılmıştır.
          </p>
           <Link href="/admin">
            <Button variant="outline" size="sm">Ana Yönetim Paneline Dön</Button>
          </Link>
        </CardContent>
    </Card>
  );
}
