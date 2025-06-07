
// Bu dosyadaki statik veriler artık birincil kaynak DEĞİLDİR.
// Projeler Firestore veritabanından src/lib/actions/project-actions.ts içindeki
// fonksiyonlar aracılığıyla yönetilmektedir.
// Bu dosya, eski referanslar için veya gelecekteki olası bir
// başlangıç verisi (seed) mekanizması için saklanabilir.

export interface ProjectItem {
  id: string; // Firestore document ID (user-defined slug)
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

// Mock data - ARTIK KULLANILMIYOR, Firestore'a taşındı.
export const projectItems: ProjectItem[] = [
  {
    id: 'proje-1-eski', // ID'ler Firestore'da benzersiz olmalı, eski veri olduğunu belirtmek için değiştirdim.
    title: 'Kurumsal Web Sitesi Yenileme Projesi (Eski Veri)',
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
  // Diğer eski projeler...
];

// Bu fonksiyonlar artık src/lib/actions/project-actions.ts içinde bulunuyor ve Firestore kullanıyor.
// export async function getAllProjects(): Promise<ProjectItem[]> {
//   // Artık Firestore'dan çekiliyor, bu fonksiyon güncel değil.
//   return projectItems;
// }

// export async function getProjectData(id: string): Promise<ProjectItem | undefined> {
//   // Artık Firestore'dan çekiliyor, bu fonksiyon güncel değil.
//   return projectItems.find((project) => project.id === id);
// }

// export async function generateStaticParams() {
//    // Artık Firestore'dan çekiliyor, bu fonksiyon güncel değil.
//   return projectItems.map((project) => ({
//     id: project.id,
//   }));
// }

    