
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Paintbrush, AlertTriangle } from 'lucide-react';
// import { getAllCustomThemes, type CustomTheme } from '@/lib/actions/custom-theme-actions'; // Artık kullanılmıyor
// import DeleteCustomThemeButton from './DeleteCustomThemeButton'; // Artık kullanılmıyor

export default async function CustomThemesTableCardObsolete() {
  // const customThemes = await getAllCustomThemes(); // Veri çekmeye gerek yok

  return (
    <Card className="shadow-xl opacity-75">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
            <Paintbrush className="mr-3 h-6 w-6" /> Özel Temalar (Devre Dışı)
          </CardTitle>
          <CardDescription className="flex items-start text-sm">
            <AlertTriangle size={20} className="mr-2 mt-0.5 text-destructive flex-shrink-0" />
            Bu bölüm artık kullanılmamaktadır. Tema seçimi ana admin panelindeki "Temalar" bölümünden yapılmaktadır.
          </CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Özel Tema Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Görünen Ad</TableHead>
              <TableHead>Tema ID</TableHead>
              <TableHead>Ana Renk (Örnek)</TableHead>
              <TableHead className="text-right">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                Özel tema oluşturma ve yönetme özelliği kaldırılmıştır. Lütfen "Temalar" bölümünden önceden tanımlanmış bir tema seçin.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
