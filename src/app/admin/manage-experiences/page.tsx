
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Briefcase } from 'lucide-react';
import { getAllExperiences } from '@/lib/actions/experience-actions';
import DeleteExperienceButton from './_components/DeleteExperienceButton';
import Image from 'next/image';

export default async function ManageExperiencesPage() {
  const experiences = await getAllExperiences();

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gradient flex items-center">
            <Briefcase className="mr-3 h-8 w-8" /> Deneyim Yönetimi
          </h1>
          <p className="text-muted-foreground">Mevcut deneyimleri görüntüleyin, düzenleyin veya yenilerini ekleyin.</p>
        </div>
        <Link href="/admin/manage-experiences/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Deneyim Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-gradient">Tüm Deneyimler</CardTitle>
          <CardDescription>Toplam {experiences.length} deneyim bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 hidden md:table-cell">Logo</TableHead>
                <TableHead>Şirket</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>Tarihler</TableHead>
                <TableHead>Lokasyon</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="hidden md:table-cell">
                    <Image
                        src={exp.logoUrl || `https://placehold.co/40x40.png?text=${exp.company.substring(0,1)}`}
                        alt={`${exp.company} logo`}
                        width={40}
                        height={40}
                        className="rounded-sm object-contain"
                        data-ai-hint={exp.dataAiHint || "company logo"}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{exp.company}</TableCell>
                  <TableCell>{exp.role}</TableCell>
                  <TableCell className="text-sm">{exp.dates}</TableCell>
                  <TableCell className="text-sm">{exp.location}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-experiences/edit/${exp.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteExperienceButton
                        experienceId={exp.id}
                        experienceRole={exp.role}
                        experienceCompany={exp.company}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {experiences.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Henüz deneyim bulunmuyor.
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
