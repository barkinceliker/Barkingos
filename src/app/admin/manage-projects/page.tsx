
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, PlusCircle } from 'lucide-react';
import { getAllProjectsFromDb } from '@/lib/actions/project-actions'; // Updated import
import DeleteProjectButton from './_components/DeleteProjectButton'; // New or updated component

export default async function ManageProjectsPage() {
  const projects = await getAllProjectsFromDb();

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Proje Yönetimi</h1>
          <p className="text-muted-foreground">Mevcut projeleri görüntüleyin, düzenleyin veya yenilerini ekleyin.</p>
        </div>
        <Link href="/admin/manage-projects/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Proje Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tüm Projeler</CardTitle>
          <CardDescription>Toplam {projects.length} proje bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID (Slug)</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Teknolojiler</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-mono text-xs">{project.id}</TableCell>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={project.status === 'Tamamlandı' ? 'default' : project.status === 'Devam Ediyor' ? 'secondary' : 'outline'}
                      className={
                        project.status === 'Tamamlandı' ? 'bg-green-500 hover:bg-green-600 text-white' :
                        project.status === 'Devam Ediyor' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                        'border-blue-500 text-blue-500'
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{project.technologies.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-projects/edit/${project.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Henüz proje bulunmuyor.
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

    