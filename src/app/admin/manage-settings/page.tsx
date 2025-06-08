
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Settings, Paintbrush, AlertTriangle } from 'lucide-react'; 

export default function ManageSettingsPageObsolete() {
  
  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="flex items-start space-x-3">
        <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Site Ayarları Yönetimi (Artık Kullanılmıyor)</h1>
          <p className="text-muted-foreground mt-2">
              Bu sayfa artık doğrudan kullanılmamaktadır. Site ayarları (Genel Ayarlar ve Tema Seçimi) ana yönetim panelindeki ilgili akordeon bölümlerinden yönetilmektedir.
              Özel tema oluşturma/düzenleme özelliği kaldırılmıştır.
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card className="shadow-lg opacity-50 cursor-not-allowed">
              <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <Palette className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Tema Seçimi</CardTitle>
                  <CardDescription className="text-sm mt-1">Ana yönetim panelinden yönetin.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Settings className="mr-2 h-4 w-4" /> Ayarları Yönet
                  </Button>
              </CardContent>
            </Card>
            <Card className="shadow-lg opacity-50 cursor-not-allowed">
              <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <Paintbrush className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Özel Temaları Yönet (Devre Dışı)</CardTitle>
                  <CardDescription className="text-sm mt-1">Bu özellik kaldırıldı.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Settings className="mr-2 h-4 w-4" /> Ayarları Yönet
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
