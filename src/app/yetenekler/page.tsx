import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Database, Server, Palette, Cloud, GitBranch, Brain } from 'lucide-react'; // Example icons

interface Skill {
  name: string;
  proficiency: number;
  category: string;
  icon?: React.ElementType;
}

const skillsData: Skill[] = [
  { name: 'HTML5 & CSS3', proficiency: 95, category: 'Frontend', icon: Code },
  { name: 'JavaScript (ES6+)', proficiency: 90, category: 'Frontend', icon: Code },
  { name: 'React & Next.js', proficiency: 85, category: 'Frontend', icon: Code },
  { name: 'TypeScript', proficiency: 80, category: 'Frontend', icon: Code },
  { name: 'Tailwind CSS', proficiency: 90, category: 'Frontend', icon: Palette },
  { name: 'Node.js & Express.js', proficiency: 75, category: 'Backend', icon: Server },
  { name: 'Python & Django/Flask', proficiency: 70, category: 'Backend', icon: Server },
  { name: 'SQL (PostgreSQL, MySQL)', proficiency: 80, category: 'Database', icon: Database },
  { name: 'NoSQL (MongoDB)', proficiency: 70, category: 'Database', icon: Database },
  { name: 'RESTful API Tasarımı', proficiency: 85, category: 'Backend', icon: Server },
  { name: 'GraphQL', proficiency: 70, category: 'Backend', icon: Server },
  { name: 'Git & GitHub', proficiency: 90, category: 'Araçlar', icon: GitBranch },
  { name: 'Docker', proficiency: 65, category: 'DevOps', icon: Cloud },
  { name: 'AWS Temelleri', proficiency: 60, category: 'DevOps', icon: Cloud },
  { name: 'UI/UX Prensipleri', proficiency: 75, category: 'Tasarım', icon: Palette },
  { name: 'Figma', proficiency: 70, category: 'Tasarım', icon: Palette },
  { name: 'Problem Çözme', proficiency: 90, category: 'Diğer', icon: Brain },
  { name: 'Takım Çalışması', proficiency: 95, category: 'Diğer', icon: Brain },
];

const skillCategories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tasarım', 'Araçlar', 'Diğer'];

export default function YeteneklerPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Yeteneklerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sahip olduğum teknik ve sosyal beceriler, uzmanlık alanlarım ve yetkinlik seviyelerim.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {skillCategories.map(category => {
          const categorySkills = skillsData.filter(skill => skill.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <Card key={category} className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySkills.map((skill) => {
                  const IconComponent = skill.icon;
                  return (
                    <div key={skill.name}>
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
    </div>
  );
}
