
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle, Brain } from 'lucide-react'; // Brain for skills
import { getAllSkills } from '@/lib/actions/skill-actions';
import DeleteSkillButton from './_components/DeleteSkillButton';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';
import { Progress } from '@/components/ui/progress';

export default async function ManageSkillsPage() {
  const skills = await getAllSkills();

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gradient">Yetenek Yönetimi</h1>
          <p className="text-muted-foreground">Mevcut yetenekleri görüntüleyin, düzenleyin veya yenilerini ekleyin.</p>
        </div>
        <Link href="/admin/manage-skills/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Yetenek Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-gradient">Tüm Yetenekler</CardTitle>
          <CardDescription>Toplam {skills.length} yetenek bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">İkon</TableHead>
                <TableHead>Yetenek Adı</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Yetkinlik</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => {
                const IconComponent = getLucideIcon(skill.iconName || 'Brain'); // Default to Brain if no icon
                return (
                  <TableRow key={skill.id}>
                    <TableCell>
                      <IconComponent className="h-6 w-6 text-accent" />
                    </TableCell>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={skill.proficiency} className="w-24 h-2 [&>div]:bg-accent" />
                        <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/manage-skills/edit/${skill.id}`}>
                          <Pencil className="mr-1 h-4 w-4" /> Düzenle
                        </Link>
                      </Button>
                      <DeleteSkillButton skillId={skill.id} skillName={skill.name} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {skills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Henüz yetenek bulunmuyor.
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
