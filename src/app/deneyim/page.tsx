
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, CalendarDays, MapPin } from 'lucide-react';
import { getAllExperiences, type ExperienceInput } from '@/lib/actions/experience-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DeneyimPage() {
  const experienceItems: Array<ExperienceInput & { id: string }> = await getAllExperiences();

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Deneyimlerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Profesyonel kariyerim boyunca edindiğim tecrübeler, üstlendiğim roller ve katkıda bulunduğum projeler.
        </p>
      </section>

      {experienceItems.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir deneyim bulunmuyor.</p>
          <Link href="/" passHref>
            <Button variant="link" className="mt-4">Anasayfaya Dön</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {experienceItems.map((item) => (
            <Card key={item.id} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 p-6">
                {item.logoUrl && (
                  <div className="mb-4 sm:mb-0 flex-shrink-0">
                    <Image
                      src={item.logoUrl}
                      alt={`${item.company} logo`}
                      width={64}
                      height={64}
                      className="rounded-md border object-contain"
                      data-ai-hint={item.dataAiHint || "company logo"}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="font-headline text-2xl text-gradient">{item.role}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-accent">{item.company}</CardDescription>
                  <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 space-x-4">
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-4 w-4" /> {item.dates}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" /> {item.location}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="list-disc list-inside space-y-2 text-foreground/90">
                  {item.description.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

