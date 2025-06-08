
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Users, BarChart } from 'lucide-react';
import { getAllProjectsFromDb, ProjectInput } from '@/lib/actions/project-actions'; // Updated import

export default async function ProjelerPage() {
  const projectItems: ProjectInput[] = await getAllProjectsFromDb(); // Fetch projects from Firestore

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Projelerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Üzerinde çalıştığım veya tamamladığım daha kapsamlı projeler ve teknik detayları.
        </p>
      </section>

      <div className="space-y-16">
        {projectItems.map((item) => (
          <Card key={item.id} id={item.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="md:flex">
              <div className="md:w-1/3">
                <Image
                  src={item.imageUrl || 'https://placehold.co/800x500.png'}
                  alt={item.title}
                  width={800}
                  height={500}
                  className="w-full h-64 md:h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  data-ai-hint={item.dataAiHint || "project screenshot"}
                />
              </div>
              <div className="md:w-2/3 flex flex-col">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-2xl md:text-3xl text-gradient mb-1">{item.title}</CardTitle>
                      {item.subtitle && <p className="text-md text-accent font-semibold mb-2">{item.subtitle}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${item.status === 'Tamamlandı' ? 'bg-green-100 text-green-700' :
                        item.status === 'Devam Ediyor' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </span>
                  </div>
                  <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  {item.longDescription && <p className="mb-4">{item.longDescription}</p>}
                  <div>
                    <h4 className="font-semibold text-gradient mb-2">Kullanılan Teknolojiler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map(tech => (
                        <span key={tech} className="text-sm bg-secondary px-2 py-1 rounded">{tech}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-secondary/30 flex flex-wrap gap-2 justify-end">
                  {item.liveDemoUrl && (
                    <Link href={item.liveDemoUrl} target="_blank" rel="noopener noreferrer" passHref>
                      <Button variant="default">
                        <Zap className="mr-2 h-4 w-4" /> Canlı Demo
                      </Button>
                    </Link>
                  )}
                  {item.sourceCodeUrl && (
                    <Link href={item.sourceCodeUrl} target="_blank" rel="noopener noreferrer" passHref>
                      <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" /> Kaynak Kodları
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
         {projectItems.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground text-lg">Henüz yayınlanmış bir proje bulunmuyor.</p>
            <Link href="/" passHref>
              <Button variant="link" className="mt-4">Anasayfaya Dön</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
    

