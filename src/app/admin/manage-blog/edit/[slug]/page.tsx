
import BlogPostForm from '@/components/admin/forms/BlogPostForm';
import { getBlogPostBySlug, updateBlogPost, BlogPostInput } from '@/lib/actions/blog-actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';

interface EditBlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { slug } = params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }
  
  async function handleUpdateBlogPost(data: BlogPostInput) {
    "use server"; // Next.js Server Action
    // updateBlogPost ilk parametre olarak originalSlug'ı bekliyor.
    // data içinde yeni slug olabilir (eğer kullanıcı değiştirdiyse),
    // bu yüzden ilk parametre olarak params.slug (veya post.slug) kullanılmalı.
    return updateBlogPost(post!.slug, data); 
  }

  return (
    <div className="space-y-6">
      <BlogPostForm 
        initialData={post} 
        onSubmitAction={handleUpdateBlogPost} 
        isEditing={true} 
      />
    </div>
  );
}
