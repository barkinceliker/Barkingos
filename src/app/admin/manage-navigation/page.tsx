
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListCollapse, AlertTriangle } from 'lucide-react'; 

export default function ManageNavigationPageObsolete() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <ListCollapse className="mr-3 h-8 w-8" /> Navigasyon Yönetimi (Devre Dışı)
        </h1>
        <p className="text-muted-foreground flex items-start">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-1" />
          Dinamik navigasyon yönetimi kaldırıldığı için bu bölüm artık kullanılmamaktadır.
          Navigasyon öğeleri artık doğrudan <code>src/components/layout/Header.tsx</code> dosyasındaki <code>staticNavItems</code> dizisinden statik olarak yönetilmektedir.
        </p>
      </section>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Bilgilendirme</CardTitle>
          <CardDescription>
            Lütfen navigasyon öğelerini düzenlemek için ilgili kod dosyasını güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Link href="/admin" passHref>
            <Button variant="default" size="lg">Ana Yönetim Paneline Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
