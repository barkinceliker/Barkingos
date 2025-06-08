
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Trash2, Palette } from 'lucide-react';
import { getAllCustomThemes, type CustomTheme } from '@/lib/actions/custom-theme-actions';
import DeleteCustomThemeButton from './_components/DeleteCustomThemeButton'; // Create this component

export default async function ManageCustomThemesPage() {
  const customThemes = await getAllCustomThemes();

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
            <Palette className="mr-3 h-8 w-8" /> Özel Tema Yönetimi
          </h1>
          <p className="text-muted-foreground">Oluşturduğunuz özel temaları görüntüleyin, düzenleyin veya yenilerini ekleyin.</p>
        </div>
        <Link href="/admin/manage-settings/custom-themes/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Özel Tema Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tüm Özel Temalar</CardTitle>
          <CardDescription>Toplam {customThemes.length} özel tema bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görünen Ad</TableHead>
                <TableHead>Tema ID (Kısa Ad)</TableHead>
                <TableHead>Ana Renk (Örnek)</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customThemes.map((theme) => (
                <TableRow key={theme.id}>
                  <TableCell className="font-medium">{theme.displayName}</TableCell>
                  <TableCell className="font-mono text-xs">{theme.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: `hsl(${theme['--primary'] || '0 0% 0%'})` }}
                        title={`Primary: ${theme['--primary']}`}
                      ></div>
                       <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: `hsl(${theme['--accent'] || '0 0% 0%'})` }}
                        title={`Accent: ${theme['--accent']}`}
                      ></div>
                       <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: `hsl(${theme['--background'] || '0 0% 100%'})` }}
                        title={`Background: ${theme['--background']}`}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-settings/custom-themes/edit/${theme.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteCustomThemeButton themeId={theme.id!} themeName={theme.displayName} />
                  </TableCell>
                </TableRow>
              ))}
              {customThemes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Henüz özel tema bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
