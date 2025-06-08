
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase } from "lucide-react";
import { getHomepageContent } from "@/lib/actions/page-content-actions";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const content = await getHomepageContent();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-6">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
            {content.heroSubtitle}
          </p>
          <div className="space-x-4">
            <Link href="/portfoy" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Portfolyomu Gör <Briefcase className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/iletisim" passHref>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                İletişime Geç
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Me Snippet */}
      <section className="py-12">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center text-primary">{content.aboutSnippetTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-lg">
            <p className="mb-4">
              {content.aboutSnippetDescription}
            </p>
            <Link href="/hakkimda" passHref>
              <Button variant="link" className="text-accent hover:text-accent/80 text-lg">
                Daha Fazla Oku <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Recent Projects Placeholder */}
      <section className="py-12">
        <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-10 text-primary">{content.recentProjectsTitle}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <Image 
                src={`https://placehold.co/600x400.png?text=Proje+${item}`} 
                alt={`Proje ${item}`} 
                width={600} 
                height={400} 
                className="w-full h-48 object-cover"
                data-ai-hint="abstract technology" 
              />
              <CardHeader>
                <CardTitle className="font-headline">Proje Başlığı {item}</CardTitle>
                <CardDescription>Bu projenin kısa bir açıklaması burada yer alacak. Kullanılan teknolojiler ve projenin amacı vurgulanabilir.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/projeler#proje-${item}`} passHref> {/* Bu linkler gerçek proje ID'lerine göre güncellenmeli */}
                  <Button variant="outline" className="w-full">Detayları Gör</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/projeler" passHref>
            <Button variant="default" size="lg">Tüm Projeler <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Recent Blog Posts Placeholder */}
      <section className="py-12 bg-secondary/30 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-10 text-primary">{content.recentBlogPostsTitle}</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((item) => (
            <Card key={item} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline">Blog Yazısı Başlığı {item}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">1 Ocak 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Blog yazısının kısa bir özeti. Okuyucuyu meraklandıracak ve devamını okumaya teşvik edecek bilgiler...</p>
                <Link href={`/blog/yazi-${item}`} passHref> {/* Bu linkler gerçek blog slug'larına göre güncellenmeli */}
                  <Button variant="link" className="p-0 text-accent hover:text-accent/80">
                    Devamını Oku <BookOpen className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/blog" passHref>
            <Button variant="default" size="lg">Tüm Yazılar <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
