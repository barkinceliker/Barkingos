
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit3 } from 'lucide-react';

export default function ManageContentPage() {
  const manageablePages = [
    {
      name: 'Hakkımda Sayfası',
      description: '"Hakkımda" sayfasının başlıklarını, metinlerini ve profil resmini düzenleyin.',
      editUrl: '/admin/manage-content/hakkimda',
      icon: FileText,
    },
    // Gelecekte diğer sayfalar buraya eklenebilir
    // {
    //   name: 'Hizmetler Sayfası',
    //   description: '"Hizmetler" sayfasındaki servis kartlarını ve açıklamalarını yönetin.',
    //   editUrl: '/admin/manage-content/hizmetler',
    //   icon: Settings,
    // },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Site İçerik Yönetimi</h1>
        <p className="text-muted-foreground">Sitenizin ana sayfalarının içeriklerini buradan düzenleyebilirsiniz.</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manageablePages.map((page) => {
          const Icon = page.icon;
          return (
            <Card key={page.name} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{page.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">{page.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={page.editUrl} passHref>
                  <Button className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" /> Düzenle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
         <Card className="shadow-lg opacity-50 cursor-not-allowed">
            <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-muted/30 rounded-md">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Hizmetler Sayfası</CardTitle>
                  <CardDescription className="text-sm mt-1">Hizmetler sayfasının içeriğini düzenleyin. (Yakında)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Edit3 className="mr-2 h-4 w-4" /> Düzenle
                  </Button>
              </CardContent>
        </Card>
        <Card className="shadow-lg opacity-50 cursor-not-allowed">
            <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-muted/30 rounded-md">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">İletişim Sayfası</CardTitle>
                  <CardDescription className="text-sm mt-1">İletişim sayfasındaki bilgileri düzenleyin. (Yakında)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                  <Button className="w-full" disabled>
                    <Edit3 className="mr-2 h-4 w-4" /> Düzenle
                  </Button>
              </CardContent>
        </Card>
      </div>
    </div>
  );
}
