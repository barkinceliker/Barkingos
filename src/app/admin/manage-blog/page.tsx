
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, PlusCircle } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/actions/blog-actions';
import DeleteBlogPostButton from './_components/DeleteBlogPostButton'; // Yeni bileşen

export default async function ManageBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Blog Yazısı Yönetimi</h1>
          <p className="text-muted-foreground">Mevcut blog yazılarını görüntüleyin, düzenleyin veya yenilerini ekleyin.</p>
        </div>
        <Link href="/admin/manage-blog/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Yazı Ekle
          </Button>
        </Link>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tüm Blog Yazıları</CardTitle>
          <CardDescription>Toplam {posts.length} yazı bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}> {/* post.id (Firestore doc ID) veya post.slug kullanılabilir */}
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manage-blog/edit/${post.slug}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Düzenle
                      </Link>
                    </Button>
                    <DeleteBlogPostButton slug={post.slug} postTitle={post.title} />
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Henüz blog yazısı bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
