
// Bu sayfanın içeriği (EditHomepageForm) artık doğrudan /src/app/admin/page.tsx içinde
// "Anasayfa İçeriği" akordeon bölümünde kullanılmaktadır.
// Bu dosya doğrudan bir sayfa olarak kullanılmayacak.

import EditHomepageForm from '@/components/admin/forms/EditHomepageForm';
import { getHomepageContent } from '@/lib/actions/page-content-actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditAnasayfaContentPageStandalone() {
  const homepageContent = await getHomepageContent();

  if (!homepageContent) {
    return <p>Anasayfa içeriği yüklenemedi veya bulunamadı.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Anasayfa İçeriğini Düzenle (Eski Sayfa)</CardTitle>
          <CardDescription>
            Bu bölümdeki anasayfa içeriği artık ana yönetim panelindeki "Anasayfa İçeriği" akordeon bölümünden yönetilmektedir.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditHomepageForm initialData={homepageContent} />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
    
