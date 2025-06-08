
// Bu sayfa artık kullanılmıyor. 
// Tüm veri yönetimi (Blog, Projeler, Hizmetler, Yetenekler, Deneyimler) 
// artık doğrudan /src/app/admin/page.tsx içindeki akordeon bölümlerine taşındı.

import BlogManagementContent from '@/app/admin/manage-blog/_components/BlogManagementContent';
import ProjectManagementContent from '@/app/admin/manage-projects/_components/ProjectManagementContent';
import ServiceManagementContent from '@/app/admin/manage-services/_components/ServiceManagementContent';
import SkillManagementContent from '@/app/admin/manage-skills/_components/SkillManagementContent';
import ExperienceManagementContent from '@/app/admin/manage-experiences/_components/ExperienceManagementContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ManageDataPageObsolete({
  searchParams,
}: {
  searchParams: { section?: string };
}) {
  const section = searchParams.section;

  let contentToRender = null;
  let pageTitle = "Veri Yönetimi (Artık Kullanılmıyor)";
  let pageDescription = `Bu bölümdeki ${section || 'veri'} yönetimi artık ana yönetim panelindeki ilgili akordeon bölümünden yönetilmektedir.`;

  switch (section) {
    case 'blog':
      contentToRender = <BlogManagementContent />;
      break;
    case 'projects':
      contentToRender = <ProjectManagementContent />;
      break;
    case 'services':
      contentToRender = <ServiceManagementContent />;
      break;
    case 'skills':
      contentToRender = <SkillManagementContent />;
      break;
    case 'experiences':
      contentToRender = <ExperienceManagementContent />;
      break;
    default:
      pageTitle = "Geçersiz Bölüm (Artık Kullanılmıyor)";
      pageDescription = "Lütfen ana admin panelinden geçerli bir yönetim bölümü seçin.";
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
              Lütfen ana admin paneli ana sayfasından geçerli bir bölüm seçin.
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
      <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
