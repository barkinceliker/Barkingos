
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

export default function ManageNavigationPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Navigasyon Yönetimi</h1>
        <p className="text-muted-foreground">Sitenizin ana navigasyon menüsündeki öğeleri buradan yönetebilirsiniz.</p>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Navigasyon Öğeleri</CardTitle>
          <CardDescription>
            Bu özellik şu anda geliştirme aşamasındadır. Yakında navigasyon öğelerini ekleyebilecek, düzenleyebilecek ve sıralayabileceksiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <p className="text-xl text-muted-foreground mb-4">Bu sayfa yapım aşamasındadır.</p>
          <Link href="/admin" passHref>
            <Button variant="outline">Admin Paneline Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
