
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, LayoutDashboard, Newspaper, FolderKanban, Sparkles, Brain, Briefcase, FileText, MailIcon, ClipboardList, Palette } from 'lucide-react';

// Data fetching functions for embedded forms
import { getHomepageContent } from '@/lib/actions/page-content-actions';
import { getHakkimdaContent } from '@/lib/actions/page-content-actions';
import { getSiteGeneralSettings, getThemeSetting } from '@/lib/actions/settings-actions'; 
import { getResumeContent } from '@/lib/actions/resume-actions'; 

// Form Components to embed
import EditHomepageForm from '@/components/admin/forms/EditHomepageForm';
import EditHakkimdaPageForm from '@/components/admin/forms/EditHakkimdaPageForm';
import SiteGeneralSettingsForm from '@/components/admin/forms/SiteGeneralSettingsForm'; 
import EditResumeForm from "@/components/admin/forms/EditResumeForm"; 
import ThemeSelectorCard from '@/app/admin/themes/_components/ThemeSelectorCard'; // Tema seçici kartı eklendi

// Management Content Components (Tables and links)
import BlogManagementContent from '@/app/admin/manage-blog/_components/BlogManagementContent';
import ProjectManagementContent from '@/app/admin/manage-projects/_components/ProjectManagementContent';
import ServiceManagementContent from '@/app/admin/manage-services/_components/ServiceManagementContent';
import SkillManagementContent from '@/app/admin/manage-skills/_components/SkillManagementContent';
import ExperienceManagementContent from '@/app/admin/manage-experiences/_components/ExperienceManagementContent';
import ContactMessagesTableCard from '@/app/admin/contact-messages/_components/ContactMessagesTableCard';


export default async function AdminUnifiedPage() {
  const homepageContent = await getHomepageContent();
  const hakkimdaContent = await getHakkimdaContent();
  const siteGeneralSettings = await getSiteGeneralSettings(); 
  const resumeContent = await getResumeContent(); 
  // Tema ayarını burada çekmeye gerek yok, ThemeSelectorCard kendi içinde hallediyor.

  const accordionSections = [
    { 
      value: "anasayfa", 
      title: "Anasayfa İçeriği", 
      icon: LayoutDashboard, 
      description: "Sitenizin anasayfasında görünecek başlıkları ve metinleri buradan yönetin.",
      content: <EditHomepageForm initialData={homepageContent} /> 
    },
    { 
      value: "hakkimda", 
      title: "Hakkımda Sayfası İçeriği", 
      icon: FileText,
      description: "Hakkımda sayfasının başlıklarını, metinlerini ve profil resmi bilgilerini yönetin.",
      content: <EditHakkimdaPageForm initialData={hakkimdaContent} /> 
    },
    { 
      value: "ozgecmis", 
      title: "Özgeçmiş Yönetimi", 
      icon: ClipboardList, 
      description: "Özgeçmiş sayfasındaki bilgileri (deneyim, eğitim, beceriler vb.) buradan yönetin.",
      content: <EditResumeForm initialData={resumeContent} /> 
    },
    { 
      value: "blog", 
      title: "Blog Yazıları Yönetimi", 
      icon: Newspaper,
      description: "Mevcut blog yazılarını görüntüleyin, düzenleyin veya yenilerini ekleyin.",
      content: <BlogManagementContent /> 
    },
    { 
      value: "projeler", 
      title: "Proje Yönetimi", 
      icon: FolderKanban,
      description: "Mevcut projeleri görüntüleyin, düzenleyin veya yenilerini ekleyin.",
      content: <ProjectManagementContent /> 
    },
    { 
      value: "hizmetler", 
      title: "Hizmet Yönetimi", 
      icon: Sparkles,
      description: "Sitede sunulan hizmetleri ekleyin, düzenleyin veya silin.",
      content: <ServiceManagementContent /> 
    },
    { 
      value: "yetenekler", 
      title: "Yetenek Yönetimi", 
      icon: Brain,
      description: "Yeteneklerinizi ve yetkinlik seviyelerinizi yönetin.",
      content: <SkillManagementContent /> 
    },
    { 
      value: "deneyimler", 
      title: "Deneyim Yönetimi", 
      icon: Briefcase,
      description: "Profesyonel deneyimlerinizi ve iş geçmişinizi yönetin.",
      content: <ExperienceManagementContent /> 
    },
    {
      value: "genel-site-ayarlari",
      title: "Genel Site Ayarları",
      icon: Settings,
      description: "Sitenizin genel başlığını buradan yönetin.",
      content: <SiteGeneralSettingsForm initialData={siteGeneralSettings} />
    },
    { 
      value: "gelen-mesajlar", 
      title: "Gelen İletişim Mesajları", 
      icon: MailIcon,
      description: "Sitenizin iletişim formundan gönderilen mesajları görüntüleyin.",
      content: <ContactMessagesTableCard />
    },
    { 
      value: "temalar", 
      title: "Tema Yönetimi", 
      icon: Palette,
      description: "Sitenizin genel görünümünü ve renk şemasını buradan seçin.",
      content: <ThemeSelectorCard /> // Tema seçici kartı buraya eklendi
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="text-center py-10 md:py-12 bg-card shadow-xl rounded-xl border border-border">
        <Settings className="h-16 w-16 text-gradient mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Site Yönetim Paneli</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          Web sitenizin tüm içeriğini ve ayarlarını tek bir yerden yönetin. Aşağıdaki bölümlerden düzenlemek istediğinizi seçin.
        </p>
      </section>

      <Accordion type="multiple" className="w-full space-y-6">
        {accordionSections.map((section) => {
          const Icon = section.icon;
          return (
            <AccordionItem 
              value={section.value} 
              key={section.value} 
              className="border border-border bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <AccordionTrigger className="p-6 hover:no-underline group">
                <div className="flex items-center text-left w-full">
                  <div className="p-3 bg-accent/10 rounded-lg mr-5 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-headline font-semibold text-gradient group-hover:text-primary/90 transition-colors">{section.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 pr-4 group-hover:text-foreground/80 transition-colors">{section.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t border-border/50 bg-background/30 rounded-b-xl">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
    
