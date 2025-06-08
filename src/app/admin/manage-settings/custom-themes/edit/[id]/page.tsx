
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Palette } from 'lucide-react';

export default async function EditCustomThemePageObsolete() {
  return (
    <div className="space-y-6 p-4 md:p-8">
       <Card className="shadow-md max-w-2xl mx-auto opacity-75">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-headline text-primary">Özel Tema Düzenleme (Devre Dışı)</CardTitle>
          <CardDescription>
           Özel tema düzenleme özelliği kaldırılmıştır. Tema seçimi ana yönetim panelindeki "Temalar" bölümünden yapılmaktadır.
          </CardDescription>
        </CardHeader>
         <CardContent className="text-center py-8">
            <Palette size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">
              Lütfen sitenizin temasını ana yönetim panelindeki "Temalar" bölümünden seçiniz.
            </p>
            <Link href="/admin">
              <Button variant="outline">Ana Yönetim Paneline Dön</Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
