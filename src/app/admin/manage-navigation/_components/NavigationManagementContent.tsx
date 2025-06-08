
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, ExternalLink } from 'lucide-react';
import { getAllNavItems } from '@/lib/actions/navigation-actions';
import DeleteNavItemButton from './DeleteNavItemButton';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

export default async function NavigationManagementContent() {
  const navItems = await getAllNavItems(); // This should sort by 'order' as per action

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Tüm Navigasyon Öğeleri</CardTitle>
          <CardDescription>Toplam {navItems.length} öğe bulundu. Buradan yeni öğe ekleyebilir veya mevcutları düzenleyebilirsiniz.</CardDescription>
        </div>
        <Link href="/admin/manage-navigation/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Navigasyon Öğesi Ekle
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%] text-center">Sıra</TableHead>
              <TableHead className="w-[25%]">Etiket</TableHead>
              <TableHead className="w-[30%]">Bağlantı (href)</TableHead>
              <TableHead className="w-[15%]">İkon Adı</TableHead>
              <TableHead className="w-[10%] text-center">Hedef</TableHead>
              <TableHead className="text-right w-[15%]">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {navItems.map((item) => {
              const IconComponent = item.iconName ? getLucideIcon(item.iconName) : null;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-center">{item.order}</TableCell>
                  <TableCell>
                    {IconComponent && <IconComponent className="inline-block mr-2 h-4 w-4 text-muted-foreground" />}
                    {item.label}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.href}</TableCell>
                  <TableCell className="font-mono text-xs">{item.iconName || '-'}</TableCell>
                  <TableCell className="text-center">
                    {item.target === '_blank' ? <ExternalLink className="h-4 w-4 mx-auto text-muted-foreground" title="Yeni Sekme" /> : <span title="Aynı Sekme">-</span>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-navigation/edit/${item.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteNavItemButton navItemId={item.id!} navItemLabel={item.label} />
                  </TableCell>
                </TableRow>
              );
            })}
            {navItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Henüz navigasyon öğesi bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
