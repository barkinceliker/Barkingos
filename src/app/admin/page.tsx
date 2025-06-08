
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Newspaper, FolderKanban, ListTree, Sparkles, Mail, Brain, Briefcase, Edit3, Palette } from 'lucide-react';

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Admin Paneli</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Web sitesi yönetimi ve içerik araçlarına buradan ulaşabilirsiniz.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Newspaper className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Blog Yazısı Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Mevcut blog yazılarınızı yönetin, yenilerini ekleyin veya düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-blog" passHref>
              <Button className="w-full">Blogları Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <FolderKanban className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Proje Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Mevcut projelerinizi yönetin, yenilerini ekleyin veya düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-projects" passHref>
              <Button className="w-full">Projeleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Hizmet Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Sitede sunulan hizmetleri ekleyin, düzenleyin veya silin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-services" passHref>
              <Button className="w-full">Hizmetleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Brain className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Yetenek Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Yeteneklerinizi ve yetkinlik seviyelerinizi yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-skills" passHref>
              <Button className="w-full">Yetenekleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Briefcase className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Deneyim Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Profesyonel deneyimlerinizi ve iş geçmişinizi yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-experiences" passHref>
              <Button className="w-full">Deneyimleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <FileText className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Sayfa İçerik Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Anasayfa, Hakkımda gibi statik sayfa içeriklerini düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-content" passHref>
              <Button className="w-full">İçerikleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Palette className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Site Ayarları</CardTitle>
            <CardDescription className="text-center">
              Sitenizin genel ayarlarını (tema vb.) yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-settings" passHref>
              <Button className="w-full">Ayarları Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Gelen Mesajlar</CardTitle>
            <CardDescription className="text-center">
              İletişim formundan gönderilen mesajları görüntüleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/contact-messages" passHref>
              <Button className="w-full">Mesajları Gör</Button>
            </Link>
          </CardContent>
        </Card>
        
      </section>
    </div>
  );
}
