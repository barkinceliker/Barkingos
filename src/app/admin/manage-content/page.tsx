
// Bu sayfa artık kullanılmıyor. 
// Anasayfa ve Hakkımda içerik yönetimi doğrudan /src/app/admin/page.tsx içindeki
// akordeon bölümlerine taşındı.

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit3, Home } from 'lucide-react';

export default function ManageContentPageObsolete() {

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Site İçerik Yönetimi (Artık Kullanılmıyor)</h1>
        <p className="text-muted-foreground">
            Sayfa içerikleri artık ana yönetim panelindeki ilgili akordeon bölümlerinden yönetilmektedir.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg opacity-50 cursor-not-allowed">
              <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <Home className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Anasayfa İçeriği</CardTitle>
                  <CardDescription className="text-sm mt-1">Ana yönetim panelinden düzenleyin.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Edit3 className="mr-2 h-4 w-4" /> Düzenle
                  </Button>
              </CardContent>
            </Card>
             <Card className="shadow-lg opacity-50 cursor-not-allowed">
            <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Hakkımda Sayfası</CardTitle>
                  <CardDescription className="text-sm mt-1">Ana yönetim panelinden düzenleyin.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Edit3 className="mr-2 h-4 w-4" /> Düzenle
                  </Button>
              </CardContent>
        </Card>
      </div>
        <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
