
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Award, Users } from 'lucide-react';
import { getHakkimdaContent, HakkimdaPageContent } from '@/lib/actions/page-content-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic'; // İçerik her zaman güncel olsun

export default async function HakkimdaPage() {
  const content = await getHakkimdaContent();

  if (!content) {
    // getHakkimdaContent her zaman bir şeyler döndürmeli (varsayılan dahil)
    // Eğer bir şekilde null dönerse notFound() çağırılabilir.
    notFound();
  }

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">{content.pageTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {content.pageSubtitle}
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1 flex justify-center">
          <Image
            src={content.profileImageUrl || "https://placehold.co/400x400.png"}
            alt="Benim Profil Fotoğrafım"
            width={300}
            height={300}
            className="rounded-full shadow-lg border-4 border-primary/50 object-cover"
            data-ai-hint={content.profileImageAiHint || "professional portrait"}
            priority // Mark as priority if it's above the fold or LCP
          />
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Ben Kimim?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg text-foreground/90">
              {content.whoAmI_p1 && <p>{content.whoAmI_p1}</p>}
              {content.whoAmI_p2 && <p>{content.whoAmI_p2}</p>}
              {content.whoAmI_p3_hobbies && <p>{content.whoAmI_p3_hobbies}</p>}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Deneyim</h3>
          <p className="text-muted-foreground">{content.stat_experience_value}</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Award className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Uzmanlık Alanları</h3>
          <p className="text-muted-foreground">{content.stat_expertise_value}</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Takım Çalışması</h3>
          <p className="text-muted-foreground">{content.stat_teamwork_value}</p>
        </Card>
      </section>
      
      <section>
        <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">{content.mission_title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg text-foreground/90">
              {content.mission_p1 && <p>{content.mission_p1}</p>}
            </CardContent>
          </Card>
      </section>
    </div>
  );
}

export async function generateMetadata() {
  const content = await getHakkimdaContent(); // Dinamik olarak çek
  if (!content) {
    return {
      title: 'Hakkımda | Sayfa Bulunamadı',
    }
  }
  return {
    title: `${content.pageTitle || 'Hakkımda'} | BenimSitem`,
    description: content.pageSubtitle || 'Hakkımda sayfası açıklaması.',
  }
}

    