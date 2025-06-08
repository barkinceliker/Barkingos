
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Palette, AlertTriangle } from "lucide-react";

export default function ThemeSettingsFormCardObsolete() {

  return (
    <Card className="shadow-lg opacity-75">
        <CardHeader>
            <CardTitle className="font-headline text-xl text-primary flex items-center">
                <Palette className="mr-3 h-6 w-6" /> Site Teması (Devre Dışı)
            </CardTitle>
            <CardDescription className="flex items-start text-sm">
              <AlertTriangle size={20} className="mr-2 mt-0.5 text-destructive flex-shrink-0" />
              Bu bölüm artık kullanılmamaktadır. Tema seçimi ana admin panelindeki "Temalar" bölümünden yapılmaktadır.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[150px]">
          <p className="text-muted-foreground text-center">
            Tema seçimi için lütfen ana admin panelindeki "Temalar" bölümünü kullanın.
          </p>
        </CardContent>
    </Card>
  );
}
