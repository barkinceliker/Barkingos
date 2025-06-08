
// Bu sayfa artık kullanılmıyor. 
// Tema ayarları ve özel tema yönetimi doğrudan /src/app/admin/page.tsx içindeki
// akordeon bölümlerine taşındı.

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Settings, Paintbrush } from 'lucide-react'; 

export default function ManageSettingsPageObsolete() {
  
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Site Ayarları Yönetimi (Artık Kullanılmıyor)</h1>
        <p className="text-muted-foreground">
            Site ayarları artık ana yönetim panelindeki ilgili akordeon bölümlerinden yönetilmektedir.
        </p>
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
                  <CardTitle className="font-headline text-xl">Özel Temaları Yönet</CardTitle>
                  <CardDescription className="text-sm mt-1">Ana yönetim panelinden yönetin.</CardDescription>
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
