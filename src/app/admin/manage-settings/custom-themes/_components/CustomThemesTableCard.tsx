
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Paintbrush } from 'lucide-react';
import { getAllCustomThemes, type CustomTheme } from '@/lib/actions/custom-theme-actions';
import DeleteCustomThemeButton from './DeleteCustomThemeButton';

export default async function CustomThemesTableCard() {
  const customThemes = await getAllCustomThemes();

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
            <Paintbrush className="mr-3 h-6 w-6" /> Özel Temalar
          </CardTitle>
          <CardDescription>Toplam {customThemes.length} özel tema bulundu. Buradan yeni tema ekleyebilir veya mevcutları düzenleyebilirsiniz.</CardDescription>
        </div>
        <Link href="/admin/manage-settings/custom-themes/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Özel Tema Ekle
          </Button>
        </Link>
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
  );
}
