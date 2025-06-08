
import { CalendarDays, Tag } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBlogPostBySlug, getAllPostSlugs, type BlogPostInput } from '@/lib/actions/blog-actions';

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  if (!Array.isArray(slugs) || !slugs.every(s => typeof s.slug === 'string')) {
    console.error("[Blog generateStaticParams] getAllPostSlugs did not return the expected format. Received:", slugs);
    return []; 
  }
  return slugs;
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const currentSlug = params.slug;

  if (typeof currentSlug !== 'string' || !currentSlug) {
    console.error(`[BlogPostPage] Invalid or missing slug: "${currentSlug}"`);
    notFound();
  }

  console.log(`[BlogPostPage] Fetching post for slug: "${currentSlug}"`);
  const post: (BlogPostInput & { id: string }) | null = await getBlogPostBySlug(currentSlug);

  if (!post) {
    console.warn(`[BlogPostPage] Post with slug "${currentSlug}" not found by getBlogPostBySlug.`);
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-4">
        <Image
          src={post.imageUrl || 'https://placehold.co/1200x600.png'}
          alt={post.title}
          width={1200}
          height={600}
          className="rounded-lg shadow-lg w-full max-h-[400px] object-cover"
          data-ai-hint={post.dataAiHint || "blog header"}
          priority
        />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient">{post.title}</h1>
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
        <CardContent className="prose prose-lg max-w-none py-8 text-foreground prose-headings:font-headline prose-headings:text-gradient prose-p:text-foreground prose-a:text-accent prose-strong:text-primary prose-code:font-code prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Card>
    </article>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const currentSlug = params.slug;
  if (typeof currentSlug !== 'string' || !currentSlug) {
    console.error(`[Blog generateMetadata] Invalid or missing slug: "${currentSlug}"`);
    return {
      title: 'Geçersiz Yazı Adresi',
    };
  }

  console.log(`[Blog generateMetadata] Fetching metadata for slug: "${currentSlug}"`);
  const post = await getBlogPostBySlug(currentSlug);

  if (!post) {
    console.warn(`[Blog generateMetadata] Post with slug "${currentSlug}" not found for metadata.`);
    return {
      title: 'Yazı Bulunamadı',
    };
  }
  return {
    title: `${post.title} | BenimSitem Blog`,
    description: post.summary || post.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
  };
}
