
// Bu dosyadaki statik veriler artık birincil kaynak DEĞİLDİR.
// Blog yazıları Firestore veritabanından src/lib/actions/blog-actions.ts içindeki
// fonksiyonlar aracılığıyla yönetilmektedir.
// Bu dosya, eski referanslar için veya gelecekteki olası bir
// başlangıç verisi (seed) mekanizması için saklanabilir.

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  summary?: string;
  content: string; 
  dataAiHint?: string;
}

// Mock data - ARTIK KULLANILMIYOR, Firestore'a taşındı.
export const blogPosts: BlogPost[] = [
  {
    slug: 'ilk-yazim',
    title: 'Web Geliştirmede Son Trendler (Eski Veri)',
    date: '15 Temmuz 2024',
    category: 'Teknoloji',
    tags: ['Web Geliştirme', 'JavaScript', 'React', 'Next.js', 'AI'],
    imageUrl: 'https://placehold.co/1200x600.png',
    summary: 'Modern web geliştirme dünyasındaki en son teknolojiler, araçlar ve yaklaşımlar üzerine kapsamlı bir inceleme.',
    dataAiHint: 'technology trends',
    content: `
      <p class="mb-4 text-lg">Bu içerik artık Firestore'dan gelmektedir. Bu statik veri güncel olmayabilir.</p>
    `,
  },
  // Diğer eski yazılar...
];

// Bu fonksiyonlar artık src/lib/actions/blog-actions.ts içinde bulunuyor ve Firestore kullanıyor.
// export async function getAllPosts(): Promise<BlogPost[]> {
//   return blogPosts;
// }

// export async function getPostData(slug: string): Promise<BlogPost | undefined> {
//   return blogPosts.find((post) => post.slug === slug);
// }

// export async function generateStaticParams() {
//   return blogPosts.map((post) => ({
//     slug: post.slug,
//   }));
// }
