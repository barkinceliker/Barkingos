
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle } from 'lucide-react';
import { getAllServices } from '@/lib/actions/service-actions';
import DeleteServiceButton from './DeleteServiceButton';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';

export default async function ServiceManagementContent() {
  const services = await getAllServices();

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Tüm Hizmetler</CardTitle>
          <CardDescription>Toplam {services.length} hizmet bulundu.</CardDescription>
        </div>
        <Link href="/admin/manage-services/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Hizmet Ekle
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">İkon</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>Açıklama (Kısa)</TableHead>
              <TableHead className="text-right">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              const IconComponent = getLucideIcon(service.iconName);
              return (
                <TableRow key={service.id}>
                  <TableCell>
                    <IconComponent className="h-6 w-6 text-accent" />
                  </TableCell>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{service.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-services/edit/${service.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteServiceButton serviceId={service.id} serviceTitle={service.title} />
                  </TableCell>
                </TableRow>
              );
            })}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Henüz hizmet bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
