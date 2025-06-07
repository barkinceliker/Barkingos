import { CalendarDays, Tag } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  content: string; // HTML content or Markdown to be rendered
  dataAiHint?: string;
}

// Mock data - in a real app, this would come from a CMS or database
const blogPosts: BlogPost[] = [
  {
    slug: 'ilk-yazim',
    title: 'Web Geliştirmede Son Trendler',
    date: '15 Temmuz 2024',
    category: 'Teknoloji',
    tags: ['Web Geliştirme', 'JavaScript', 'React', 'Next.js', 'AI'],
    imageUrl: 'https://placehold.co/1200x600.png',
    dataAiHint: 'technology trends',
    content: `
      <p class="mb-4 text-lg">Modern web geliştirme sürekli evrim geçiren bir alan. Bu yazıda, 2024 yılında öne çıkan bazı önemli trendlere ve teknolojilere göz atacağız.</p>
      
      <h2 class="text-2xl font-headline font-semibold mt-6 mb-3 text-primary">1. Yapay Zeka (AI) Entegrasyonları</h2>
      <p class="mb-4">Yapay zeka, web geliştirmede giderek daha fazla yer buluyor. Akıllı chatbotlardan kişiselleştirilmiş kullanıcı deneyimlerine kadar birçok alanda AI destekli çözümler görüyoruz. Özellikle doğal dil işleme (NLP) ve makine öğrenimi (ML) modelleri, web uygulamalarına yeni yetenekler kazandırıyor.</p>
      <pre class="bg-muted p-4 rounded-md overflow-x-auto mb-4"><code class="font-code text-sm">
// Örnek bir AI API çağrısı (Python)
import openai

openai.api_key = 'YOUR_API_KEY'

response = openai.Completion.create(
  engine="davinci-codex",
  prompt="Python dilinde bir web sunucusu yaz:",
  max_tokens=150
)

print(response.choices[0].text)
      </code></pre>
      
      <h2 class="text-2xl font-headline font-semibold mt-6 mb-3 text-primary">2. Sunucu Taraflı Bileşenler (Server Components)</h2>
      <p class="mb-4">React Server Components (RSC) ve benzeri yaklaşımlar, performansı artırmak ve JavaScript yükünü azaltmak için popülerleşiyor. Sunucuda render edilen bileşenler sayesinde daha hızlı ilk yükleme süreleri ve daha iyi SEO elde edilebiliyor.</p>

      <h2 class="text-2xl font-headline font-semibold mt-6 mb-3 text-primary">3. WebAssembly (Wasm)</h2>
      <p class="mb-4">WebAssembly, tarayıcıda C++, Rust gibi dillerle yazılmış kodları yüksek performansla çalıştırmayı mümkün kılıyor. Özellikle oyunlar, video düzenleme araçları ve karmaşık hesaplama gerektiren uygulamalar için ideal bir teknoloji.</p>
      
      <figure class="my-6">
        <img src="https://placehold.co/800x400.png" alt="Teknoloji İllüstrasyonu" class="rounded-md shadow-lg mx-auto" data-ai-hint="abstract tech"/>
        <figcaption class="text-center text-sm text-muted-foreground mt-2">Web teknolojilerinin geleceği parlak.</figcaption>
      </figure>

      <p class="mb-4">Bu trendler, web geliştirmenin ne kadar dinamik ve heyecan verici bir alan olduğunu bir kez daha gösteriyor. Geliştiriciler olarak sürekli öğrenmeye ve yeni teknolojilere adapte olmaya devam etmeliyiz.</p>
    `,
  },
   {
    slug: 'ikinci-yazim',
    title: 'Etkili UI/UX Tasarımı Nasıl Yapılır?',
    date: '20 Temmuz 2024',
    category: 'Tasarım',
    tags: ['UI Design', 'UX Design', 'Kullanıcı Deneyimi', 'Arayüz Tasarımı'],
    imageUrl: 'https://placehold.co/1200x600.png',
    dataAiHint: 'design process',
    content: `
      <p class="mb-4 text-lg">Kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) tasarımı, başarılı bir dijital ürünün temel taşlarıdır. İşte etkili UI/UX tasarımı için bazı ipuçları.</p>
      <h2 class="text-2xl font-headline font-semibold mt-6 mb-3 text-primary">Kullanıcıyı Anlamak</h2>
      <p class="mb-4">Tasarım sürecinin en başında kullanıcılarınızı anlamanız gerekir. Hedef kitlenizin ihtiyaçları, beklentileri ve davranışları hakkında derinlemesine bilgi sahibi olmak, doğru tasarım kararları vermenizi sağlar.</p>
      <pre class="bg-muted p-4 rounded-md overflow-x-auto mb-4"><code class="font-code text-sm">
/* CSS'de kullanıcı dostu bir buton örneği */
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #3F51B5; /* Primary color */
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #303F9F; /* Darker primary */
}
      </code></pre>
      <p class="mb-4">Bu basit CSS örneği bile, hover efekti gibi küçük detayların kullanıcı deneyimini nasıl etkileyebileceğini gösterir.</p>
    `,
  },
  {
    slug: 'ucuncu-yazim',
    title: 'Proje Yönetiminde Çevik Metodolojiler',
    date: '25 Temmuz 2024',
    category: 'Proje Yönetimi',
    tags: ['Agile', 'Scrum', 'Kanban', 'Proje Yönetimi'],
    imageUrl: 'https://placehold.co/1200x600.png',
    dataAiHint: 'team collaboration',
    content: `
      <p class="mb-4 text-lg">Çevik (Agile) metodolojiler, yazılım geliştirme ve proje yönetimi süreçlerinde esneklik, hız ve verimlilik sağlamak amacıyla kullanılır.</p>
      <h2 class="text-2xl font-headline font-semibold mt-6 mb-3 text-primary">Scrum ve Kanban</h2>
      <p class="mb-4">Scrum, kısa iterasyonlar (sprint'ler) halinde çalışmayı ve düzenli toplantılarla ilerlemeyi teşvik eder. Kanban ise iş akışını görselleştirerek darboğazları belirlemeye ve sürekli akışı sağlamaya odaklanır.</p>
      <p class="mb-4">Her iki metodoloji de müşteri geri bildirimlerine önem verir ve değişen gereksinimlere hızla adapte olmayı hedefler.</p>
    `
  }
];

async function getPostData(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((post) => post.slug === slug);
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-4">
        <Image 
          src={post.imageUrl} 
          alt={post.title} 
          width={1200} 
          height={600} 
          className="rounded-lg shadow-lg w-full max-h-[400px] object-cover"
          data-ai-hint={post.dataAiHint || "blog header"} 
          priority
        />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">{post.title}</h1>
        <div className="flex flex-wrap items-center space-x-4 text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-accent" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <Tag className="mr-2 h-5 w-5 text-accent" />
            <span>{post.category}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-accent/10 text-accent-foreground">{tag}</Badge>
          ))}
        </div>
      </header>

      <Card className="shadow-xl">
        <CardContent className="prose prose-lg max-w-none py-8 text-foreground prose-headings:font-headline prose-headings:text-primary prose-p:text-foreground prose-a:text-accent prose-strong:text-primary prose-code:font-code prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Card>
    </article>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);
  if (!post) {
    return {
      title: 'Yazı Bulunamadı',
    };
  }
  return {
    title: `${post.title} | BenimSitem Blog`,
    description: post.content.substring(0, 160).replace(/<[^>]*>?/gm, ''), // Basic summary from content
  };
}
