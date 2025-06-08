
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  repoUrl?: string;
  tags: string[];
  dataAiHint?: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'E-ticaret Platformu Geliştirme',
    description: 'Modern ve kullanıcı dostu bir e-ticaret platformu. Ürün listeleme, sepet işlemleri ve ödeme entegrasyonları özelliklerini içerir.',
    imageUrl: 'https://placehold.co/600x400.png',
    projectUrl: '#',
    repoUrl: '#',
    tags: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Stripe'],
    dataAiHint: 'online shopping'
  },
  {
    id: '2',
    title: 'Mobil Uygulama Tasarımı ve Geliştirme',
    description: 'iOS ve Android için geliştirilmiş, kullanıcı etkileşimini ön planda tutan bir sosyal medya uygulaması.',
    imageUrl: 'https://placehold.co/600x400.png',
    projectUrl: '#',
    tags: ['React Native', 'Firebase', 'UI/UX Design'],
    dataAiHint: 'mobile app'
  },
  {
    id: '3',
    title: 'Veri Analizi Paneli',
    description: 'Büyük veri setlerini işleyerek anlamlı görseller sunan interaktif bir analiz paneli.',
    imageUrl: 'https://placehold.co/600x400.png',
    repoUrl: '#',
    tags: ['Python', 'Django', 'D3.js', 'Pandas'],
    dataAiHint: 'data dashboard'
  },
  {
    id: '4',
    title: 'Kişisel Blog Altyapısı',
    description: 'Markdown destekli, SEO dostu ve minimalist tasarımlı kişisel blog sistemi.',
    imageUrl: 'https://placehold.co/600x400.png',
    projectUrl: '#',
    repoUrl: '#',
    tags: ['Gatsby', 'GraphQL', 'Contentful CMS'],
    dataAiHint: 'personal blog'
  },
];

export default function PortfoyPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Portföyüm</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Yaptığım çalışmalar, geliştirdiğim projeler ve kazandığım deneyimlerin bir özeti.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={600}
              height={400}
              className="w-full h-56 object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={item.dataAiHint || "project image"}
            />
            <CardHeader>
              <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 p-4 bg-secondary/30">
              {item.projectUrl && (
                <Link href={item.projectUrl} target="_blank" rel="noopener noreferrer" passHref>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" /> Projeyi Gör
                  </Button>
                </Link>
              )}
              {item.repoUrl && (
                <Link href={item.repoUrl} target="_blank" rel="noopener noreferrer" passHref>
                  <Button variant="ghost" size="sm">
                    <Github className="mr-2 h-4 w-4" /> Kodlar
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
