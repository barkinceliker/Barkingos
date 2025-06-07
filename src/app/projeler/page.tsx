import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Users, BarChart } from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  status: 'Tamamlandı' | 'Devam Ediyor' | 'Planlanıyor';
  technologies: string[];
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  dataAiHint?: string;
}

const projectItems: ProjectItem[] = [
  {
    id: 'proje-1',
    title: 'Kurumsal Web Sitesi Yenileme Projesi',
    subtitle: 'X Şirketi İçin Modern Çözüm',
    description: 'Lider bir teknoloji firması için kapsamlı web sitesi tasarımı ve geliştirilmesi. Performans, SEO ve kullanıcı deneyimi odaklı bir çalışma.',
    longDescription: 'Proje, eskiyen kurumsal web sitesinin tamamen modernize edilmesini amaçlamıştır. Yeni tasarım, şirketin marka kimliğini yansıtırken, en son web teknolojileri kullanılarak hızlı ve güvenli bir platform oluşturulmuştur. İçerik yönetim sistemi entegrasyonu ile kolay güncellenebilirlik sağlanmıştır.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Tamamlandı',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Strapi CMS', 'GraphQL'],
    liveDemoUrl: '#',
    sourceCodeUrl: '#',
    dataAiHint: 'corporate website'
  },
  {
    id: 'proje-2',
    title: 'SaaS Platformu Geliştirme',
    subtitle: 'Start-up İçin Ölçeklenebilir Çözüm',
    description: 'Yenilikçi bir SaaS (Software as a Service) platformunun uçtan uca geliştirilmesi. Abonelik yönetimi, kullanıcı rolleri ve API entegrasyonları içerir.',
    longDescription: 'Bu proje, belirli bir sektördeki problemleri çözmeyi hedefleyen bir SaaS platformunun geliştirilmesini kapsamaktadır. Mikroservis mimarisi ve bulut tabanlı altyapı kullanılarak ölçeklenebilirlik ve güvenilirlik sağlanmıştır. Kullanıcı dostu arayüzü ile karmaşık işlevleri basitleştirmeyi amaçlar.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Devam Ediyor',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'React', 'Docker', 'AWS'],
    dataAiHint: 'saas platform'
  },
  {
    id: 'proje-3',
    title: 'Açık Kaynak Kütüphane Geliştirme',
    subtitle: 'Geliştirici Topluluğuna Katkı',
    description: 'Belirli bir problemi çözen, performansı yüksek ve kullanımı kolay bir açık kaynak kütüphane geliştirme projesi.',
    longDescription: 'Bu proje, geliştiricilerin sık karşılaştığı bir soruna çözüm sunan bir kütüphane oluşturmayı hedeflemektedir. Kapsamlı dokümantasyon, testler ve topluluk desteği ile geliştiricilerin işini kolaylaştırması amaçlanmaktadır.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Planlanıyor',
    technologies: ['TypeScript', 'Jest', 'Rollup.js'],
    sourceCodeUrl: '#',
    dataAiHint: 'open source library'
  },
];

export default function ProjelerPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Projelerim</h1>
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
                  src={item.imageUrl}
                  alt={item.title}
                  width={800}
                  height={500}
                  className="w-full h-64 md:h-full object-cover"
                  data-ai-hint={item.dataAiHint || "project screenshot"}
                />
              </div>
              <div className="md:w-2/3 flex flex-col">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-2xl md:text-3xl mb-1">{item.title}</CardTitle>
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
                    <h4 className="font-semibold text-primary mb-2">Kullanılan Teknolojiler:</h4>
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
                   <Link href={`/projeler/${item.id}/detay`} passHref> {/* Placeholder for potential detailed page */}
                      <Button variant="ghost">
                        <BarChart className="mr-2 h-4 w-4" /> Daha Fazla Bilgi
                      </Button>
                    </Link>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
