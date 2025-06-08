
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react'; // Default icon
import { getAllSkills, type SkillInput } from '@/lib/actions/skill-actions';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function YeteneklerPage() {
  const skillsFromDb = await getAllSkills();

  // Group skills by category
  const skillsByCategory: { [key: string]: (SkillInput & { id: string })[] } = {};
  skillsFromDb.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  const skillCategories = Object.keys(skillsByCategory).sort(); // Sort categories alphabetically

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Yeteneklerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sahip olduğum teknik ve sosyal beceriler, uzmanlık alanlarım ve yetkinlik seviyelerim.
        </p>
      </section>

      {skillsFromDb.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir yetenek bulunmuyor.</p>
          <Link href="/" passHref>
            <Button variant="link" className="mt-4">Anasayfaya Dön</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {skillCategories.map(category => {
            const categorySkills = skillsByCategory[category];
            if (categorySkills.length === 0) return null;

            return (
              <Card key={category} className="shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categorySkills.map((skill) => {
                    const IconComponent = getLucideIcon(skill.iconName || 'Brain'); // Use Brain as default
                    return (
                      <div key={skill.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            {IconComponent && <IconComponent className="h-5 w-5 mr-2 text-accent" />}
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                        <Progress value={skill.proficiency} aria-label={`${skill.name} yetkinlik seviyesi ${skill.proficiency}%`} className="h-3 [&>div]:bg-accent" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
