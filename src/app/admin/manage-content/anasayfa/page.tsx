
import { getHomepageContent } from '@/lib/actions/page-content-actions';
import EditHomepageForm from '@/components/admin/forms/EditHomepageForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditAnasayfaContentPage() {
  const homepageContent = await getHomepageContent();

  if (!homepageContent) {
    return <p>Anasayfa içeriği yüklenemedi veya bulunamadı. Lütfen veritabanı bağlantınızı ve 'sitePages/anasayfa' dokümanını kontrol edin.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Anasayfa İçeriğini Düzenle</CardTitle>
          <CardDescription>
            Sitenizin anasayfasında görünecek başlıkları ve metinleri buradan kolayca yönetebilirsiniz.
            Yaptığınız değişiklikler kaydedildikten sonra canlı anasayfada anında güncellenecektir.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditHomepageForm initialData={homepageContent} />
    </div>
  );
}
    
