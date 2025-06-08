
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Award, Users } from 'lucide-react';
import { getHakkimdaContent, HakkimdaPageContent } from '@/lib/actions/page-content-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Content should always be up-to-date

export default async function AboutMePage() {
  const content = await getHakkimdaContent();

  if (!content) {
    notFound();
  }

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">{content.pageTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {content.pageSubtitle}
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1 flex justify-center">
          <Image
            src={content.profileImageUrl || "https://placehold.co/400x400.png"}
            alt="My Profile Picture"
            width={300}
            height={300}
            className="rounded-full shadow-lg border-4 border-primary/50 object-cover"
            data-ai-hint={content.profileImageAiHint || "professional portrait"}
            priority 
          />
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-gradient">Who Am I?</CardTitle>
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
          <h3 className="text-xl font-headline font-semibold text-gradient mb-2">Experience</h3>
          <p className="text-muted-foreground">{content.stat_experience_value}</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Award className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-gradient mb-2">Areas of Expertise</h3>
          <p className="text-muted-foreground">{content.stat_expertise_value}</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-gradient mb-2">Teamwork</h3>
          <p className="text-muted-foreground">{content.stat_teamwork_value}</p>
        </Card>
      </section>
      
      <section>
        <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-gradient">{content.mission_title}</CardTitle>
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
  const content = await getHakkimdaContent(); 
  if (!content) {
    return {
      title: 'About Me | Page Not Found',
    }
  }
  return {
    title: `${content.pageTitle || 'About Me'} | MySite`, // Changed "BenimSitem"
    description: content.pageSubtitle || 'About me page description.',
  }
}
