
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, BookOpen, Briefcase, Award, Users, Zap, CalendarDays, MapPin, Lightbulb, MessageSquare, ExternalLink, Github, Download, FileText as FileTextIcon, GraduationCap } from "lucide-react";
import { Progress } from '@/components/ui/progress';

// Data fetching functions
import { getHomepageContent } from "@/lib/actions/page-content-actions";
import { getHakkimdaContent, type HakkimdaPageContent } from '@/lib/actions/page-content-actions';
import { getAllServices, type ServiceInput as ServiceType } from '@/lib/actions/service-actions';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';
import { getAllProjectsFromDb, type ProjectInput as ProjectType } from '@/lib/actions/project-actions';
import { getAllSkills, type SkillInput as SkillType } from '@/lib/actions/skill-actions';
import { getAllExperiences, type ExperienceInput as ExperienceType } from '@/lib/actions/experience-actions';
import { getAllBlogPosts, type BlogPostInput as BlogPostType } from '@/lib/actions/blog-actions';
import ContactFormSection from '@/app/iletisim/ContactFormSection'; // Client component for the form

// Özgeçmiş sayfası için statik veriler (normalde bu da bir action'dan gelebilir)
const resumePageData = {
  name: "Adınız Soyadınız",
  title: "Unvanınız, örn: Kıdemli Yazılım Geliştirici",
  profileImage: "https://placehold.co/150x150.png",
  profileImageAiHint: "professional headshot",
  experiences: [
    {
      role: "Kıdemli Yazılım Geliştirici",
      company: "Teknoloji Çözümleri A.Ş.",
      period: "Ocak 2021 - Günümüz",
      tasks: [
        "Ölçeklenebilir web uygulamaları geliştirdim.",
        "Yeni özelliklerin tasarım ve dağıtım süreçlerinde rol aldım.",
      ],
    },
    {
      role: "Yazılım Geliştirici",
      company: "Startup X",
      period: "Haziran 2018 - Aralık 2020",
      tasks: [
        "Çevik metodolojilerle ürün geliştirme süreçlerine katıldım.",
        "Kullanıcı arayüzleri ve API entegrasyonları üzerinde çalıştım.",
      ],
    },
  ],
  education: [
    {
      degree: "Bilgisayar Mühendisliği Lisans Derecesi",
      university: "Örnek Üniversite",
      period: "Eylül 2014 - Haziran 2018",
    },
  ],
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'SQL', 'UI/UX Tasarımı', 'Problem Çözme'],
  resumePdfUrl: "/resume-placeholder.pdf",
};


export default async function SinglePageApp() {
  const homepageContent = await getHomepageContent();
  const hakkimdaContent = await getHakkimdaContent();
  const services = await getAllServices();
  const projects = await getAllProjectsFromDb();
  const skillsFromDb = await getAllSkills();
  const experiences = await getAllExperiences();
  const blogPosts = await getAllBlogPosts();

  const skillsByCategory: { [key: string]: (SkillType & { id: string })[] } = {};
  skillsFromDb.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });
  const skillCategories = Object.keys(skillsByCategory).sort();

  return (
    <div className="space-y-16 md:space-y-24 lg:space-y-32">
      {/* Hero Section (from original page.tsx) */}
      <section id="anasayfa-section" className="text-center pt-16 md:pt-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-6">
            {homepageContent.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
            {homepageContent.heroSubtitle}
          </p>
          <div className="space-x-4">
            <Link href="/#projeler-section" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Projelerim <Briefcase className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#iletisim-section" passHref>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                İletişime Geç
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hakkımda Section */}
      <section id="hakkimda-section" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">{hakkimdaContent.pageTitle}</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {hakkimdaContent.pageSubtitle}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 flex justify-center">
              <Image
                src={hakkimdaContent.profileImageUrl || "https://placehold.co/400x400.png"}
                alt="Profil Fotoğrafı"
                width={300}
                height={300}
                className="rounded-full shadow-lg border-4 border-primary/50 object-cover"
                data-ai-hint={hakkimdaContent.profileImageAiHint || "professional portrait"}
              />
            </div>
            <div className="md:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary">Ben Kimim?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg text-foreground/90">
                  {hakkimdaContent.whoAmI_p1 && <p>{hakkimdaContent.whoAmI_p1}</p>}
                  {hakkimdaContent.whoAmI_p2 && <p>{hakkimdaContent.whoAmI_p2}</p>}
                  {hakkimdaContent.whoAmI_p3_hobbies && <p>{hakkimdaContent.whoAmI_p3_hobbies}</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-headline font-semibold text-primary mb-2">Deneyim</h3>
              <p className="text-muted-foreground">{hakkimdaContent.stat_experience_value}</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Award className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-headline font-semibold text-primary mb-2">Uzmanlık Alanları</h3>
              <p className="text-muted-foreground">{hakkimdaContent.stat_expertise_value}</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-headline font-semibold text-primary mb-2">Takım Çalışması</h3>
              <p className="text-muted-foreground">{hakkimdaContent.stat_teamwork_value}</p>
            </Card>
          </div>
          
          <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{hakkimdaContent.mission_title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg text-foreground/90">
                {hakkimdaContent.mission_p1 && <p>{hakkimdaContent.mission_p1}</p>}
              </CardContent>
            </Card>
        </div>
      </section>

      {/* Hizmetler Section */}
      <section id="hizmetler-section" className="py-12 md:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Hizmetlerim</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Sunduğum profesyonel hizmetler ve uzmanlık alanlarım hakkında detaylı bilgi.
            </p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = getLucideIcon(service.iconName);
              return (
                <Card key={service.id} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="items-center text-center">
                    <div className="p-4 bg-accent/10 rounded-full inline-block mb-4">
                      <IconComponent className="h-10 w-10 text-accent" />
                    </div>
                    <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-4">
                      {service.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
            {services.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir hizmet bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projeler Section */}
      <section id="projeler-section" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 space-y-12">
            <header className="text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Projelerim</h2>
                <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Üzerinde çalıştığım veya tamamladığım daha kapsamlı projeler ve teknik detayları.
                </p>
            </header>
            <div className="space-y-16">
                {projects.map((item) => (
                <Card key={item.id} id={`project-${item.id}`} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="md:flex">
                    <div className="md:w-1/3">
                        <Image
                        src={item.imageUrl || 'https://placehold.co/800x500.png'}
                        alt={item.title}
                        width={800}
                        height={500}
                        className="w-full h-64 md:h-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        data-ai-hint={item.dataAiHint || "project screenshot"}
                        />
                    </div>
                    <div className="md:w-2/3 flex flex-col">
                        <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                            <CardTitle className="font-headline text-2xl md:text-3xl mb-1">{item.title}</CardTitle>
                            {item.subtitle && <p className="text-md text-accent font-semibold mb-2">{item.subtitle}</p>}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                            ${item.status === 'Tamamlandı' ? 'bg-green-100 text-green-700' :
                                item.status === 'Devam Ediyor' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'}`}>
                            {item.status}
                            </span>
                        </div>
                        <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex-grow">
                        {item.longDescription && <p className="mb-4">{item.longDescription}</p>}
                        <div>
                            <h4 className="font-semibold text-primary mb-2">Kullanılan Teknolojiler:</h4>
                            <div className="flex flex-wrap gap-2">
                            {item.technologies.map(tech => (
                                <span key={tech} className="text-sm bg-secondary px-2 py-1 rounded">{tech}</span>
                            ))}
                            </div>
                        </div>
                        </CardContent>
                        <CardFooter className="p-6 bg-secondary/30 flex flex-wrap gap-2 justify-end">
                        {item.liveDemoUrl && (
                            <Link href={item.liveDemoUrl} target="_blank" rel="noopener noreferrer" passHref>
                            <Button variant="default">
                                <Zap className="mr-2 h-4 w-4" /> Canlı Demo
                            </Button>
                            </Link>
                        )}
                        {item.sourceCodeUrl && (
                            <Link href={item.sourceCodeUrl} target="_blank" rel="noopener noreferrer" passHref>
                            <Button variant="outline">
                                <Github className="mr-2 h-4 w-4" /> Kaynak Kodları
                            </Button>
                            </Link>
                        )}
                        </CardFooter>
                    </div>
                    </div>
                </Card>
                ))}
                {projects.length === 0 && (
                <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground text-lg">Henüz yayınlanmış bir proje bulunmuyor.</p>
                </div>
                )}
            </div>
        </div>
      </section>

      {/* Yetenekler Section */}
      <section id="yetenekler-section" className="py-12 md:py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Yeteneklerim</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Sahip olduğum teknik ve sosyal beceriler, uzmanlık alanlarım ve yetkinlik seviyelerim.
            </p>
          </header>
          {skillsFromDb.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir yetenek bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {skillCategories.map(category => {
                const categorySkills = skillsByCategory[category];
                if (categorySkills.length === 0) return null;
                const CategoryIcon = getLucideIcon(categorySkills[0].iconName || 'Brain'); // İlk yeteneğin ikonu veya varsayılan

                return (
                  <Card key={category} className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="font-headline text-2xl text-primary flex items-center">
                        <CategoryIcon className="mr-3 h-6 w-6 text-accent" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {categorySkills.map((skill) => {
                        const SkillIcon = getLucideIcon(skill.iconName || 'ChevronRight');
                        return (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <SkillIcon className="h-5 w-5 mr-2 text-accent" />
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
      </section>

      {/* Deneyim Section */}
      <section id="deneyim-section" className="py-12 md:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Deneyimlerim</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Profesyonel kariyerim boyunca edindiğim tecrübeler, üstlendiğim roller ve katkıda bulunduğum projeler.
            </p>
          </header>
          {experiences.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir deneyim bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {experiences.map((item) => (
                <Card key={item.id} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 p-6">
                    {item.logoUrl && (
                      <div className="mb-4 sm:mb-0 flex-shrink-0">
                        <Image
                          src={item.logoUrl}
                          alt={`${item.company} logo`}
                          width={64}
                          height={64}
                          className="rounded-md border object-contain"
                          data-ai-hint={item.dataAiHint || "company logo"}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="font-headline text-2xl text-primary">{item.role}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-accent">{item.company}</CardDescription>
                      <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 space-x-4">
                        <div className="flex items-center">
                          <CalendarDays className="mr-1 h-4 w-4" /> {item.dates}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" /> {item.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <ul className="list-disc list-inside space-y-2 text-foreground/90">
                      {item.description.map((desc, index) => (
                        <li key={index}>{desc}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Özgeçmiş Section */}
      <section id="ozgecmis-section" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Özgeçmişim</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Profesyonel deneyimlerimi, eğitim bilgilerimi ve yeteneklerimi içeren detaylı özgeçmişim.
            </p>
          </header>
          <Card className="max-w-3xl mx-auto shadow-xl p-6 md:p-8">
            <CardHeader className="text-center mb-6">
              <Image 
                src={resumePageData.profileImage} 
                alt="Profil Fotoğrafı" 
                width={150} 
                height={150} 
                className="rounded-full mx-auto mb-4 border-4 border-primary/30"
                data-ai-hint={resumePageData.profileImageAiHint}
              />
              <CardTitle className="font-headline text-3xl text-primary">{resumePageData.name}</CardTitle>
              <p className="text-xl text-accent">{resumePageData.title}</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h3 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
                  <Briefcase className="mr-3 h-6 w-6 text-accent" /> Deneyimlerim
                </h3>
                <div className="space-y-4 border-l-2 border-accent pl-4 ml-3">
                  {resumePageData.experiences.map((exp, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-lg">{exp.role}</h4>
                      <p className="text-muted-foreground">{exp.company} | {exp.period}</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {exp.tasks.map((task, i) => <li key={i}>{task}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
                  <GraduationCap className="mr-3 h-6 w-6 text-accent" /> Eğitimim
                </h3>
                <div className="space-y-4 border-l-2 border-accent pl-4 ml-3">
                  {resumePageData.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-lg">{edu.degree}</h4>
                      <p className="text-muted-foreground">{edu.university} | {edu.period}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
                  <Award className="mr-3 h-6 w-6 text-accent" /> Yetenekler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumePageData.skills.map(skill => (
                    <span key={skill} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </section>
              <div className="text-center pt-8">
                <a href={resumePageData.resumePdfUrl} download={`${resumePageData.name.replace(" ", "_")}_CV.pdf`}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Download className="mr-2 h-5 w-5" /> Özgeçmişi İndir (PDF)
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-2">(Bu bir placeholder linkidir.)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog-section" className="py-12 md:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 space-y-12">
          <header className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">Blog Yazılarım</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Teknoloji, tasarım ve geliştirme üzerine düşüncelerimi, deneyimlerimi ve güncel haberleri paylaştığım alan.
            </p>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <Link href={`/blog/${post.slug}`} passHref>
                  <Image
                    src={post.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full h-56 object-cover cursor-pointer"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={post.dataAiHint || "blog image"}
                  />
                </Link>
                <CardHeader>
                  <span className="text-sm text-accent font-medium mb-1">{post.category}</span>
                  <Link href={`/blog/${post.slug}`} passHref>
                    <CardTitle className="font-headline text-xl hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {post.date}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{post.summary || post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...'}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 bg-card/50">
                  <Link href={`/blog/${post.slug}`} passHref>
                    <Button variant="outline" className="w-full">
                      Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {blogPosts.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground text-lg">Henüz yayınlanmış bir blog yazısı bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* İletişim Section */}
      <section id="iletisim-section" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 space-y-12">
            <header className="text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">İletişim</h2>
                <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Benimle iletişime geçmek, projeler hakkında konuşmak veya işbirliği yapmak için aşağıdaki formu kullanabilirsiniz.
                </p>
            </header>
            <ContactFormSection />
        </div>
      </section>

    </div>
  );
}

    