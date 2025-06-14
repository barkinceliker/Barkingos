
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/actions/blog-actions'; 

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-12 rounded-xl bg-gradient-to-br from-[hsl(var(--hero-gradient-start-hsl))] via-[hsl(var(--hero-gradient-mid-hsl))] to-[hsl(var(--hero-gradient-end-hsl))] p-4 md:p-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          My thoughts, experiences, and current news on technology, design, and development.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
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
                <CardTitle className="font-headline text-xl text-gradient hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarDays className="mr-2 h-4 w-4" />
                {post.date} {/* Date format will be based on data; if using date-fns, ensure locale is en for month names */}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{post.summary || post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...'}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
              <Link href={`/blog/${post.slug}`} passHref>
                <Button variant="outline" className="w-full">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground text-lg">No blog posts published yet.</p>
            <Link href="/" passHref>
              <Button variant="link" className="mt-4">Return to Homepage</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
