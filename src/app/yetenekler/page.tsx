
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react'; // Default icon
import { getAllSkills, type SkillInput } from '@/lib/actions/skill-actions';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function SkillsPage() {
  const skillsFromDb = await getAllSkills();

  const skillsByCategory: { [key: string]: (SkillInput & { id: string })[] } = {};
  skillsFromDb.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  const skillCategories = Object.keys(skillsByCategory).sort(); 

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">My Skills</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          My technical and soft skills, areas of expertise, and proficiency levels.
        </p>
      </section>

      {skillsFromDb.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground text-lg">No skills defined yet.</p>
          <Link href="/" passHref>
            <Button variant="link" className="mt-4">Return to Homepage</Button>
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
                  <CardTitle className="font-headline text-2xl text-gradient">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categorySkills.map((skill) => {
                    const IconComponent = getLucideIcon(skill.iconName || 'Brain'); 
                    return (
                      <div key={skill.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            {IconComponent && <IconComponent className="h-5 w-5 mr-2 text-accent" />}
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                        <Progress value={skill.proficiency} aria-label={`${skill.name} proficiency ${skill.proficiency}%`} className="h-3 [&>div]:bg-accent" />
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
