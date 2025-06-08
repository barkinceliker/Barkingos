
// Bu sayfanın içeriği (EditHakkimdaPageForm) artık doğrudan /src/app/admin/page.tsx içinde
// "Hakkımda Sayfası İçeriği" akordeon bölümünde kullanılmaktadır.
// Bu dosya doğrudan bir sayfa olarak kullanılmayacak.

import { getHakkimdaContent } from '@/lib/actions/page-content-actions';
import EditHakkimdaPageForm from '@/components/admin/forms/EditHakkimdaPageForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditHakkimdaContentPageStandalone() {
  const hakkimdaContent = await getHakkimdaContent();

  if (!hakkimdaContent) {
    return <p>Hakkımda sayfası içeriği yüklenemedi veya bulunamadı.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">"Hakkımda" Sayfası İçeriğini Düzenle (Eski Sayfa)</CardTitle>
          <CardDescription>
           Bu bölümdeki "Hakkımda" sayfası içeriği artık ana yönetim panelindeki "Hakkımda Sayfası İçeriği" akordeon bölümünden yönetilmektedir.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditHakkimdaPageForm initialData={hakkimdaContent} />
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
    
