
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Newspaper, FolderKanban, ListTree, Sparkles, Mail, Brain, Briefcase, Edit3, Palette, Database } from 'lucide-react'; // Added Database icon

export default async function AdminDashboardPage() {
  const managementSections = [
    {
      title: 'Blog Yazısı Yönetimi',
      description: 'Mevcut blog yazılarınızı yönetin, yenilerini ekleyin veya düzenleyin.',
      href: '/admin/manage-data?section=blog',
      icon: Newspaper,
    },
    {
      title: 'Proje Yönetimi',
      description: 'Mevcut projelerinizi yönetin, yenilerini ekleyin veya düzenleyin.',
      href: '/admin/manage-data?section=projects',
      icon: FolderKanban,
    },
    {
      title: 'Hizmet Yönetimi',
      description: 'Sitede sunulan hizmetleri ekleyin, düzenleyin veya silin.',
      href: '/admin/manage-data?section=services',
      icon: Sparkles,
    },
    {
      title: 'Yetenek Yönetimi',
      description: 'Yeteneklerinizi ve yetkinlik seviyelerinizi yönetin.',
      href: '/admin/manage-data?section=skills',
      icon: Brain,
    },
    {
      title: 'Deneyim Yönetimi',
      description: 'Profesyonel deneyimlerinizi ve iş geçmişinizi yönetin.',
      href: '/admin/manage-data?section=experiences',
      icon: Briefcase,
    },
  ];

  const otherAdminPages = [
    {
      title: 'Sayfa İçerik Yönetimi',
      description: 'Anasayfa, Hakkımda gibi statik sayfa içeriklerini düzenleyin.',
      href: '/admin/manage-content',
      icon: FileText,
    },
    {
      title: 'Site Ayarları',
      description: 'Sitenizin genel ayarlarını (tema vb.) yönetin.',
      href: '/admin/manage-settings',
      icon: Palette, // Changed from Settings to Palette for consistency
    },
    {
      title: 'Gelen Mesajlar',
      description: 'İletişim formundan gönderilen mesajları görüntüleyin.',
      href: '/admin/contact-messages',
      icon: Mail,
    },
  ];


  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Admin Paneli</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Web sitesi yönetimi ve içerik araçlarına buradan ulaşabilirsiniz.
        </p>
      </section>

      <section className="space-y-8">
        <div>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-6 flex items-center">
                <Database className="mr-3 h-7 w-7 text-accent" /> Veri Yönetimi Bölümleri
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {managementSections.map((section) => {
                const Icon = section.icon;
                return (
                    <Card key={section.title} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                        <Icon className="h-12 w-12 text-accent" />
                        </div>
                        <CardTitle className="font-headline text-2xl text-center">{section.title}</CardTitle>
                        <CardDescription className="text-center">
                        {section.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href={section.href} passHref>
                        <Button className="w-full">{section.title.replace("Yönetimi", "Yönet")}</Button>
                        </Link>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
        </div>
        
        <div>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-6 mt-12 flex items-center">
                <Settings className="mr-3 h-7 w-7 text-accent" /> Diğer Yönetim Araçları
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherAdminPages.map((section) => {
                const Icon = section.icon;
                return (
                    <Card key={section.title} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                        <Icon className="h-12 w-12 text-accent" />
                        </div>
                        <CardTitle className="font-headline text-2xl text-center">{section.title}</CardTitle>
                        <CardDescription className="text-center">
                        {section.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href={section.href} passHref>
                        <Button className="w-full">{section.title.replace("Yönetimi", "Yönet").replace("Ayarları", "Ayarlarını Yönet").replace("Mesajlar", "Mesajları Gör")}</Button>
                        </Link>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
        </div>
      </section>
    </div>
  );
}
