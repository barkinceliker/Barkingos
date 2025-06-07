
import BlogPostForm from '@/components/admin/forms/BlogPostForm';
import { createBlogPost, BlogPostInput } from '@/lib/actions/blog-actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewBlogPostPage() {
  
  async function handleCreateBlogPost(data: BlogPostInput) {
    "use server"; // Next.js Server Action
    return createBlogPost(data);
  }

  return (
    <div className="space-y-6">
      <BlogPostForm 
        onSubmitAction={handleCreateBlogPost} 
        isEditing={false} 
      />
    </div>
  );
}
