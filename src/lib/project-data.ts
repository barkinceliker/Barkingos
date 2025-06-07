
export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  status: 'Tamamlandı' | 'Devam Ediyor' | 'Planlanıyor';
  technologies: string[];
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  dataAiHint?: string;
}

export const projectItems: ProjectItem[] = [
  {
    id: 'proje-1',
    title: 'Kurumsal Web Sitesi Yenileme Projesi',
    subtitle: 'X Şirketi İçin Modern Çözüm',
    description: 'Lider bir teknoloji firması için kapsamlı web sitesi tasarımı ve geliştirilmesi. Performans, SEO ve kullanıcı deneyimi odaklı bir çalışma.',
    longDescription: 'Proje, eskiyen kurumsal web sitesinin tamamen modernize edilmesini amaçlamıştır. Yeni tasarım, şirketin marka kimliğini yansıtırken, en son web teknolojileri kullanılarak hızlı ve güvenli bir platform oluşturulmuştur. İçerik yönetim sistemi entegrasyonu ile kolay güncellenebilirlik sağlanmıştır.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Tamamlandı',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Strapi CMS', 'GraphQL'],
    liveDemoUrl: '#',
    sourceCodeUrl: '#',
    dataAiHint: 'corporate website'
  },
  {
    id: 'proje-2',
    title: 'SaaS Platformu Geliştirme',
    subtitle: 'Start-up İçin Ölçeklenebilir Çözüm',
    description: 'Yenilikçi bir SaaS (Software as a Service) platformunun uçtan uca geliştirilmesi. Abonelik yönetimi, kullanıcı rolleri ve API entegrasyonları içerir.',
    longDescription: 'Bu proje, belirli bir sektördeki problemleri çözmeyi hedefleyen bir SaaS platformunun geliştirilmesini kapsamaktadır. Mikroservis mimarisi ve bulut tabanlı altyapı kullanılarak ölçeklenebilirlik ve güvenilirlik sağlanmıştır. Kullanıcı dostu arayüzü ile karmaşık işlevleri basitleştirmeyi amaçlar.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Devam Ediyor',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'React', 'Docker', 'AWS'],
    dataAiHint: 'saas platform'
  },
  {
    id: 'proje-3',
    title: 'Açık Kaynak Kütüphane Geliştirme',
    subtitle: 'Geliştirici Topluluğuna Katkı',
    description: 'Belirli bir problemi çözen, performansı yüksek ve kullanımı kolay bir açık kaynak kütüphane geliştirme projesi.',
    longDescription: 'Bu proje, geliştiricilerin sık karşılaştığı bir soruna çözüm sunan bir kütüphane oluşturmayı hedeflemektedir. Kapsamlı dokümantasyon, testler ve topluluk desteği ile geliştiricilerin işini kolaylaştırması amaçlanmaktadır.',
    imageUrl: 'https://placehold.co/800x500.png',
    status: 'Planlanıyor',
    technologies: ['TypeScript', 'Jest', 'Rollup.js'],
    sourceCodeUrl: '#',
    dataAiHint: 'open source library'
  },
];

export async function getAllProjects(): Promise<ProjectItem[]> {
  // In a real app, this might fetch from a database or CMS
  return projectItems;
}

export async function getProjectData(id: string): Promise<ProjectItem | undefined> {
  return projectItems.find((project) => project.id === id);
}

export async function generateStaticParams() {
  return projectItems.map((project) => ({
    id: project.id, // Assuming detail pages might use 'id' as slug
  }));
}
