
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListCollapse } from 'lucide-react'; // Assuming ListCollapse is appropriate

export default function ManageNavigationPageStandalone() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <ListCollapse className="mr-3 h-8 w-8" /> Navigasyon Yönetimi (Eski Sayfa)
        </h1>
        <p className="text-muted-foreground">
          Bu bölümdeki navigasyon yönetimi artık ana yönetim panelindeki "Navigasyon Yönetimi" akordeon bölümünden yönetilmektedir.
          Yeni öğe ekleme ve düzenleme sayfalarına oradan erişebilirsiniz.
        </p>
      </section>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Erişim Yönlendirmesi</CardTitle>
          <CardDescription>
            Lütfen navigasyon öğelerini yönetmek için ana admin panelini kullanın.
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
