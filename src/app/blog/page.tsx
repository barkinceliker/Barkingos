import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Image from 'next/image';

interface BlogPostPreview {
  slug: string;
  title: string;
  date: string;
  summary: string;
  imageUrl: string;
  category: string;
  dataAiHint?: string;
}

const blogPosts: BlogPostPreview[] = [
  {
    slug: 'ilk-yazim',
    title: 'Web Geliştirmede Son Trendler',
    date: '15 Temmuz 2024',
    summary: 'Modern web geliştirme dünyasındaki en son teknolojiler, araçlar ve yaklaşımlar üzerine kapsamlı bir inceleme.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Teknoloji',
    dataAiHint: 'web development'
  },
  {
    slug: 'ikinci-yazim',
    title: 'Etkili UI/UX Tasarımı Nasıl Yapılır?',
    date: '20 Temmuz 2024',
    summary: 'Kullanıcı deneyimini en üst düzeye çıkaran, estetik ve işlevsel arayüz tasarımları oluşturmanın püf noktaları.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Tasarım',
    dataAiHint: 'ui ux design'
  },
  {
    slug: 'ucuncu-yazim',
    title: 'Proje Yönetiminde Çevik Metodolojiler',
    date: '25 Temmuz 2024',
    summary: 'Scrum, Kanban gibi çevik (agile) metodolojilerin proje başarısına etkileri ve uygulama ipuçları.',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Proje Yönetimi',
    dataAiHint: 'agile project management'
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Teknoloji, tasarım ve geliştirme üzerine düşüncelerimi, deneyimlerimi ve güncel haberleri paylaştığım alan.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Link href={`/blog/${post.slug}`} passHref>
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={600}
                height={400}
                className="w-full h-56 object-cover cursor-pointer"
                data-ai-hint={post.dataAiHint || "blog image"}
              />
            </Link>
            <CardHeader>
              <span className="text-sm text-accent font-medium mb-1">{post.category}</span>
              <Link href={`/blog/${post.slug}`} passHref>
                <CardTitle className="font-headline text-xl hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarDays className="mr-2 h-4 w-4" />
                {post.date}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{post.summary}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
              <Link href={`/blog/${post.slug}`} passHref>
                <Button variant="outline" className="w-full">
                  Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
