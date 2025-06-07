import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, Palette, PenTool, Users, TrendingUp, Server } from 'lucide-react'; // Example icons

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

const services: ServiceItem[] = [
  {
    id: '1',
    title: 'Web Geliştirme',
    description: 'Modern, hızlı ve kullanıcı dostu web siteleri ve uygulamaları geliştiriyorum.',
    icon: Code,
    details: [
      'Kurumsal web siteleri',
      'E-ticaret platformları',
      'Özel web uygulamaları (SaaS, PWA)',
      'API Geliştirme ve Entegrasyonları',
      'Performans Optimizasyonu',
    ],
  },
  {
    id: '2',
    title: 'UI/UX Tasarımı',
    description: 'Kullanıcı odaklı, estetik ve işlevsel arayüzler tasarlıyorum.',
    icon: Palette,
    details: [
      'Kullanıcı araştırması ve persona oluşturma',
      'Wireframe ve prototip hazırlama',
      'Mobil ve web arayüz tasarımı',
      'Kullanılabilirlik testleri',
      'Tasarım sistemleri oluşturma',
    ],
  },
  {
    id: '3',
    title: 'Danışmanlık',
    description: 'Teknoloji ve dijital dönüşüm konularında stratejik danışmanlık hizmetleri sunuyorum.',
    icon: Users,
    details: [
      'Teknoloji seçimi ve mimari planlama',
      'Proje yönetimi ve çevik metodolojiler',
      'Dijital strateji geliştirme',
      'Ekip eğitimi ve mentorluk',
    ],
  },
  {
    id: '4',
    title: 'İçerik Oluşturma ve SEO',
    description: 'Blog yazılarınızın kalitesini artırmak ve SEO uyumluluğunu sağlamak için destek veriyorum.',
    icon: PenTool,
    details: [
      'Teknik SEO analizi',
      'Anahtar kelime araştırması ve içerik stratejisi',
      'Blog yazısı optimizasyonu',
      'AI destekli içerik iyileştirme',
    ],
  },
   {
    id: '5',
    title: 'Backend Geliştirme',
    description: 'Güçlü ve ölçeklenebilir sunucu tarafı uygulamaları ve API\'ler geliştiriyorum.',
    icon: Server,
    details: [
      'RESTful ve GraphQL API\'ler',
      'Veritabanı tasarımı ve yönetimi (SQL & NoSQL)',
      'Mikroservis mimarileri',
      'Kimlik doğrulama ve yetkilendirme sistemleri',
    ],
  },
  {
    id: '6',
    title: 'Proje Kurtarma ve Optimizasyon',
    description: 'Mevcut projelerinizdeki sorunları tespit edip, performans ve kararlılık iyileştirmeleri sağlıyorum.',
    icon: TrendingUp,
    details: [
      'Kod analizi ve refaktoring',
      'Performans darboğazlarının tespiti',
      'Güvenlik açıklarının kapatılması',
      'Eski sistemlerin modernizasyonu',
    ],
  },
];

export default function HizmetlerPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Hizmetlerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sunduğum profesyonel hizmetler ve uzmanlık alanlarım hakkında detaylı bilgi.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const IconComponent = service.icon;
          return (
            <Card key={service.id} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-accent/10 rounded-full inline-block mb-4">
                  <IconComponent className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
                <CardDescription className="mt-1">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-4">
                  {service.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
