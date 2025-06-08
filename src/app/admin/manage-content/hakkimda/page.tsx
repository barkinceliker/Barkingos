
import { getHakkimdaContent, HakkimdaPageContent } from '@/lib/actions/page-content-actions';
import EditHakkimdaPageForm from '@/components/admin/forms/EditHakkimdaPageForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditHakkimdaContentPage() {
  const hakkimdaContent = await getHakkimdaContent();

  if (!hakkimdaContent) {
    // getHakkimdaContent varsayılan içerik döndüreceği için bu blok normalde çalışmamalı.
    // Ama bir sorun olursa diye bir fallback.
    return <p>Hakkımda sayfası içeriği yüklenemedi veya bulunamadı. Lütfen veritabanı bağlantınızı ve 'sitePages/hakkimda' dokümanını kontrol edin.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">"Hakkımda" Sayfası İçeriğini Düzenle</CardTitle>
          <CardDescription>
            Sitenizin "Hakkımda" bölümünde görünecek tüm metinleri, başlıkları ve profil resmi bilgilerini buradan kolayca yönetebilirsiniz.
            Yaptığınız değişiklikler kaydedildikten sonra canlı sitede anında güncellenecektir.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditHakkimdaPageForm initialData={hakkimdaContent} />
    </div>
  );
}

    