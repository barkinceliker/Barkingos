
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Award, Briefcase, GraduationCap, Mail, Phone, Linkedin, Github, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getResumeContent, type ResumePageContent } from '@/lib/actions/resume-actions';
import { notFound } from 'next/navigation';

// Helper function to parse experiences and education strings
interface ParsedExperience {
  role: string;
  company: string;
  period: string;
  tasks: string[];
}

interface ParsedEducation {
  degree: string;
  university: string;
  period: string;
}

function parseExperiences(experiencesString: string): ParsedExperience[] {
  if (!experiencesString) return [];
  return experiencesString.split('---').map(block => {
    const lines = block.trim().split('\n');
    const experience: ParsedExperience = { role: '', company: '', period: '', tasks: [] };
    lines.forEach(line => {
      if (line.toLowerCase().startsWith('rol:')) experience.role = line.substring(4).trim();
      else if (line.toLowerCase().startsWith('şirket:')) experience.company = line.substring(7).trim();
      else if (line.toLowerCase().startsWith('dönem:')) experience.period = line.substring(6).trim();
      else if (line.startsWith('- ')) experience.tasks.push(line.substring(2).trim());
    });
    return experience;
  }).filter(exp => exp.role && exp.company && exp.period);
}

function parseEducation(educationString: string): ParsedEducation[] {
   if (!educationString) return [];
  return educationString.split('---').map(block => {
    const lines = block.trim().split('\n');
    const education: ParsedEducation = { degree: '', university: '', period: '' };
    lines.forEach(line => {
      if (line.toLowerCase().startsWith('derece:')) education.degree = line.substring(7).trim();
      else if (line.toLowerCase().startsWith('üniversite:')) education.university = line.substring(11).trim();
      else if (line.toLowerCase().startsWith('dönem:')) education.period = line.substring(6).trim();
    });
    return education;
  }).filter(edu => edu.degree && edu.university && edu.period);
}


export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  const resumeData = await getResumeContent();

  if (!resumeData) {
    notFound();
  }

  const parsedExperiences = parseExperiences(resumeData.experiencesString);
  const parsedEducation = parseEducation(resumeData.educationString);
  const skillsArray = resumeData.skillsString ? resumeData.skillsString.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Özgeçmişim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Profesyonel deneyimlerimi, eğitim bilgilerimi ve yeteneklerimi içeren detaylı özgeçmişim.
        </p>
      </section>

      <Card className="max-w-3xl mx-auto shadow-xl p-6 md:p-8">
        <CardHeader className="text-center mb-6">
          <Image
            src={resumeData.profileImageUrl || "https://placehold.co/150x150.png"}
            alt="Profil Fotoğrafı"
            width={150}
            height={150}
            className="rounded-full mx-auto mb-4 border-4 border-primary/30 object-cover aspect-square"
            data-ai-hint={resumeData.profileImageAiHint || "professional headshot"}
            priority
          />
          <CardTitle className="font-headline text-3xl text-gradient">{resumeData.name}</CardTitle>
          <p className="text-xl text-accent">{resumeData.title}</p>
          
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {resumeData.email && (
              <a href={`mailto:${resumeData.email}`} className="flex items-center hover:text-primary">
                <Mail className="mr-1.5 h-4 w-4" /> {resumeData.email}
              </a>
            )}
            {resumeData.phone && (
              <span className="flex items-center">
                <Phone className="mr-1.5 h-4 w-4" /> {resumeData.phone}
              </span>
            )}
            {resumeData.location && (
                <span className="flex items-center">
                    <MapPin className="mr-1.5 h-4 w-4" /> {resumeData.location}
                </span>
            )}
          </div>
          <div className="mt-3 flex justify-center items-center space-x-4">
            {resumeData.linkedinUrl && (
              <a href={resumeData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" /> <span className="sr-only">LinkedIn</span>
              </a>
            )}
            {resumeData.githubUrl && (
              <a href={resumeData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" /> <span className="sr-only">GitHub</span>
              </a>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <Briefcase className="mr-3 h-6 w-6 text-accent" /> Deneyimlerim
            </h2>
            <div className="space-y-5 border-l-2 border-accent/50 pl-4 ml-3">
              {parsedExperiences.length > 0 ? parsedExperiences.map((exp, index) => (
                <div key={`exp-${index}`} className="relative">
                  <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-accent"></span>
                  <h3 className="font-semibold text-lg text-foreground/90">{exp.role}</h3>
                  <p className="text-muted-foreground text-sm">{exp.company} | {exp.period}</p>
                  {exp.tasks.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-1.5 text-foreground/80 space-y-1">
                      {exp.tasks.map((task, i) => <li key={`task-${index}-${i}`}>{task}</li>)}
                    </ul>
                  )}
                </div>
              )) : <p className="text-muted-foreground">Henüz deneyim bilgisi eklenmemiş.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <GraduationCap className="mr-3 h-6 w-6 text-accent" /> Eğitimim
            </h2>
            <div className="space-y-5 border-l-2 border-accent/50 pl-4 ml-3">
              {parsedEducation.length > 0 ? parsedEducation.map((edu, index) => (
                <div key={`edu-${index}`} className="relative">
                   <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-accent"></span>
                  <h3 className="font-semibold text-lg text-foreground/90">{edu.degree}</h3>
                  <p className="text-muted-foreground text-sm">{edu.university} | {edu.period}</p>
                </div>
              )) : <p className="text-muted-foreground">Henüz eğitim bilgisi eklenmemiş.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <Award className="mr-3 h-6 w-6 text-accent" /> Beceriler
            </h2>
            {skillsArray.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                {skillsArray.map(skill => (
                    <span key={skill} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm shadow-sm">{skill}</span>
                ))}
                </div>
            ) : <p className="text-muted-foreground">Henüz beceri bilgisi eklenmemiş.</p>}
          </section>
          
          {resumeData.summary && (
            <section>
              <h2 className="text-2xl font-headline font-semibold text-gradient mb-3">Özet</h2>
              <p className="text-foreground/85 whitespace-pre-line">{resumeData.summary}</p>
            </section>
          )}

          {resumeData.resumePdfUrl && resumeData.resumePdfUrl !== '/resume-placeholder.pdf' && (
            <div className="text-center pt-8">
              <a href={resumeData.resumePdfUrl} target="_blank" rel="noopener noreferrer" download={`${resumeData.name.replace(/\s+/g, '_')}_CV.pdf`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  <Download className="mr-2 h-5 w-5" /> Özgeçmişi İndir (PDF)
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata() {
  const resumeData = await getResumeContent();
  if (!resumeData) {
    return {
      title: 'Özgeçmiş | Sayfa Bulunamadı',
    };
  }
  return {
    title: `${resumeData.name} | Özgeçmiş`,
    description: resumeData.summary || `${resumeData.title} olarak profesyonel deneyimlerim.`,
  };
}

    
