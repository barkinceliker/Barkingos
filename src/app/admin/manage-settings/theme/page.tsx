
import ThemeSettingsFormCardObsolete from "./_components/ThemeSettingsFormCard";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ThemeSettingsPageStandaloneObsolete() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-start space-x-3">
           <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
           <div>
            <CardTitle className="text-2xl font-headline text-primary">Tema Ayarları (Artık Kullanılmıyor)</CardTitle>
            <CardDescription className="mt-1">
              Bu bölümdeki tema ayarları kaldırılmıştır. Tema seçimi ana yönetim panelindeki "Temalar" akordeon bölümünden yapılmaktadır.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      <ThemeSettingsFormCardObsolete />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
