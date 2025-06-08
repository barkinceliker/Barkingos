
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, LayoutDashboard, Newspaper, FolderKanban, Sparkles, Brain, Briefcase, FileText, Palette, Paintbrush, MailIcon } from 'lucide-react';

// Data fetching functions for embedded forms
import { getHomepageContent } from '@/lib/actions/page-content-actions';
import { getHakkimdaContent } from '@/lib/actions/page-content-actions';

// Form Components to embed
import EditHomepageForm from '@/components/admin/forms/EditHomepageForm';
import EditHakkimdaPageForm from '@/components/admin/forms/EditHakkimdaPageForm';

// Management Content Components (Tables and links)
import BlogManagementContent from '@/app/admin/manage-blog/_components/BlogManagementContent';
import ProjectManagementContent from '@/app/admin/manage-projects/_components/ProjectManagementContent';
import ServiceManagementContent from '@/app/admin/manage-services/_components/ServiceManagementContent';
import SkillManagementContent from '@/app/admin/manage-skills/_components/SkillManagementContent';
import ExperienceManagementContent from '@/app/admin/manage-experiences/_components/ExperienceManagementContent';

// Settings and Other Content Components
import ThemeSettingsFormCard from '@/app/admin/manage-settings/theme/_components/ThemeSettingsFormCard'; // Client Component
import CustomThemesTableCard from '@/app/admin/manage-settings/custom-themes/_components/CustomThemesTableCard'; // Server Component
import ContactMessagesTableCard from '@/app/admin/contact-messages/_components/ContactMessagesTableCard'; // Server Component


export default async function AdminUnifiedPage() {
  const homepageContent = await getHomepageContent();
  const hakkimdaContent = await getHakkimdaContent();

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
      value: "tema-ayarlari", 
      title: "Site Tema Ayarları", 
      icon: Palette,
      description: "Sitenizin genel görünümünü ve renk paletini seçin.",
      content: <ThemeSettingsFormCard /> // Client Component
    },
    { 
      value: "ozel-temalar", 
      title: "Özel Tema Yönetimi", 
      icon: Paintbrush,
      description: "Oluşturduğunuz özel temaları görüntüleyin, düzenleyin veya yenilerini ekleyin.",
      content: <CustomThemesTableCard /> // Server Component
    },
     { 
      value: "gelen-mesajlar", 
      title: "Gelen İletişim Mesajları", 
      icon: MailIcon,
      description: "Sitenizin iletişim formundan gönderilen mesajları görüntüleyin.",
      content: <ContactMessagesTableCard /> // Server Component
    },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card shadow-md rounded-lg">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-3">Site Yönetim Paneli</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          Web sitenizin tüm içeriğini ve ayarlarını tek bir yerden yönetin. Aşağıdaki bölümlerden düzenlemek istediğinizi seçin.
        </p>
      </section>

      <Accordion type="multiple" className="w-full space-y-4">
        {accordionSections.map((section) => {
          const Icon = section.icon;
          return (
            <AccordionItem value={section.value} key={section.value} className="border bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center text-left">
                  <Icon className="h-7 w-7 mr-4 text-accent flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-headline font-semibold text-primary">{section.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 pr-4">{section.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
