
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, PlusCircle, Eye, EyeOff } from 'lucide-react';
import { getAllNavItems, NavigationItem } from '@/lib/navigation-data';
import NavItemsTableActions from '@/components/admin/navigation/NavItemsTableActions'; // Will create this client component

export const revalidate = 0; // Revalidate this page on every request

export default async function ManageNavigationPage() {
  const navItems = await getAllNavItems({ includeHidden: true });

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Navigasyon Yönetimi</h1>
          <p className="text-muted-foreground">Site navigasyon öğelerini yönetin.</p>
        </div>
        <Link href="/admin/manage-navigation/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Navigasyon Öğesi Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tüm Navigasyon Öğeleri</CardTitle>
          <CardDescription>Toplam {navItems.length} öğe bulundu. Öğeler 'Sıra' numarasına göre artan şekilde listelenir.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etiket</TableHead>
                <TableHead>Link (href)</TableHead>
                <TableHead>İkon</TableHead>
                <TableHead className="text-center">Sıra</TableHead>
                <TableHead className="text-center">Görünür</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {navItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>{item.href}</TableCell>
                  <TableCell>{item.iconName || '-'}</TableCell>
                  <TableCell className="text-center">{item.order}</TableCell>
                  <TableCell className="text-center">
                    {item.isVisible ? <Eye className="h-5 w-5 text-green-500 mx-auto" /> : <EyeOff className="h-5 w-5 text-red-500 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <NavItemsTableActions item={item} />
                  </TableCell>
                </TableRow>
              ))}
              {navItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Henüz navigasyon öğesi bulunmuyor.
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
