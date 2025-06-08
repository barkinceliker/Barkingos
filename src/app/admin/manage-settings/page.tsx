
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Settings } from 'lucide-react';

export default function ManageSettingsPage() {
  const settingsSections = [
    {
      name: 'Tema Ayarları',
      description: 'Sitenizin genel görünümünü ve renk paletini özelleştirin.',
      editUrl: '/admin/manage-settings/theme',
      icon: Palette,
    },
    // Gelecekte diğer ayar bölümleri buraya eklenebilir
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Site Ayarları Yönetimi</h1>
        <p className="text-muted-foreground">Sitenizin genel ayarlarını buradan yönetebilirsiniz.</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.name} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                <div className="p-3 bg-accent/10 rounded-md">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{section.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">{section.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={section.editUrl} passHref>
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" /> Ayarları Yönet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
