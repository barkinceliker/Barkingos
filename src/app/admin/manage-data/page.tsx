
import BlogManagementContent from '@/app/admin/manage-blog/_components/BlogManagementContent';
import ProjectManagementContent from '@/app/admin/manage-projects/_components/ProjectManagementContent';
import ServiceManagementContent from '@/app/admin/manage-services/_components/ServiceManagementContent';
import SkillManagementContent from '@/app/admin/manage-skills/_components/SkillManagementContent';
import ExperienceManagementContent from '@/app/admin/manage-experiences/_components/ExperienceManagementContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function ManageDataPage({
  searchParams,
}: {
  searchParams: { section?: string };
}) {
  const section = searchParams.section;

  let contentToRender = null;
  let pageTitle = "Veri Yönetimi";
  let pageDescription = "Yönetilecek bir bölüm seçin veya geçerli bir bölüm görüntüleyin.";

  switch (section) {
    case 'blog':
      contentToRender = <BlogManagementContent />;
      pageTitle = "Blog Yazısı Yönetimi";
      pageDescription = "Mevcut blog yazılarını görüntüleyin, düzenleyin veya yenilerini ekleyin.";
      break;
    case 'projects':
      contentToRender = <ProjectManagementContent />;
      pageTitle = "Proje Yönetimi";
      pageDescription = "Mevcut projeleri görüntüleyin, düzenleyin veya yenilerini ekleyin.";
      break;
    case 'services':
      contentToRender = <ServiceManagementContent />;
      pageTitle = "Hizmet Yönetimi";
      pageDescription = "Mevcut hizmetleri görüntüleyin, düzenleyin veya yenilerini ekleyin.";
      break;
    case 'skills':
      contentToRender = <SkillManagementContent />;
      pageTitle = "Yetenek Yönetimi";
      pageDescription = "Mevcut yetenekleri görüntüleyin, düzenleyin veya yenilerini ekleyin.";
      break;
    case 'experiences':
      contentToRender = <ExperienceManagementContent />;
      pageTitle = "Deneyim Yönetimi";
      pageDescription = "Mevcut deneyimleri görüntüleyin, düzenleyin veya yenilerini ekleyin.";
      break;
    default:
      pageTitle = "Geçersiz Bölüm";
      pageDescription = "Lütfen admin panelinden geçerli bir yönetim bölümü seçin.";
      contentToRender = (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Bölüm Bulunamadı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Görüntülemeye çalıştığınız yönetim bölümü (<code>{section || 'belirtilmemiş'}</code>) bulunamadı veya geçersiz.
              Lütfen admin paneli ana sayfasından geçerli bir bölüm seçin.
            </p>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </section>
      {contentToRender}
    </div>
  );
}
