import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, CalendarDays, MapPin } from 'lucide-react';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  description: string[];
  logoUrl?: string;
  dataAiHint?: string;
}

const experienceItems: ExperienceItem[] = [
  {
    id: '1',
    company: 'Teknoloji Çözümleri A.Ş.',
    role: 'Kıdemli Yazılım Geliştirici',
    dates: 'Ocak 2021 - Günümüz',
    location: 'İstanbul, Türkiye',
    description: [
      'Ölçeklenebilir web uygulamaları geliştirdim ve bakımını yaptım.',
      'Yeni özelliklerin tasarımından dağıtımına kadar tüm süreçlerde aktif rol aldım.',
      'Genç geliştiricilere mentorluk yaptım ve kod incelemeleri gerçekleştirdim.',
      'Agile/Scrum metodolojileri ile çalıştım, sprint planlama ve retrospektif toplantılarına katıldım.',
    ],
    logoUrl: 'https://placehold.co/100x100.png?text=TCS',
    dataAiHint: 'company logo'
  },
  {
    id: '2',
    company: 'Dijital Inovasyon Ltd.',
    role: 'Orta Düzey Yazılım Geliştirici',
    dates: 'Haziran 2018 - Aralık 2020',
    location: 'Ankara, Türkiye',
    description: [
      'Müşteri odaklı projelerde React ve Node.js kullanarak tam yığın çözümler ürettim.',
      'API entegrasyonları ve veritabanı yönetimi konularında çalıştım.',
      'Kullanıcı arayüzü tasarımlarını hayata geçirdim ve performans optimizasyonları yaptım.',
    ],
    logoUrl: 'https://placehold.co/100x100.png?text=DI',
    dataAiHint: 'company logo'
  },
  {
    id: '3',
    company: 'Web Tasarım Stüdyosu',
    role: 'Stajyer Yazılım Geliştirici',
    dates: 'Haziran 2017 - Ağustos 2017',
    location: 'İzmir, Türkiye',
    description: [
      'Temel web geliştirme teknolojileri (HTML, CSS, JavaScript) üzerine pratik deneyim kazandım.',
      'Küçük ölçekli web sitelerinin geliştirilmesine ve güncellenmesine yardımcı oldum.',
      'Ekip içinde proje geliştirme süreçlerini deneyimledim.',
    ],
    logoUrl: 'https://placehold.co/100x100.png?text=WTS',
    dataAiHint: 'company logo'
  },
];

export default function DeneyimPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Deneyimlerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Profesyonel kariyerim boyunca edindiğim tecrübeler, üstlendiğim roller ve katkıda bulunduğum projeler.
        </p>
      </section>

      <div className="space-y-8 max-w-4xl mx-auto">
        {experienceItems.map((item) => (
          <Card key={item.id} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-start space-x-4 p-6">
              {item.logoUrl && (
                <Image
                  src={item.logoUrl}
                  alt={`${item.company} logo`}
                  width={64}
                  height={64}
                  className="rounded-md border"
                  data-ai-hint={item.dataAiHint || "company logo"}
                />
              )}
              <div className="flex-1">
                <CardTitle className="font-headline text-2xl text-primary">{item.role}</CardTitle>
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
    </div>
  );
}
