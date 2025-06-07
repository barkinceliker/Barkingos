
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, Newspaper, FolderKanban } from 'lucide-react';
// import { logout } from '@/lib/actions/auth'; // Logout action no longer needed here
// import { redirect } from 'next/navigation'; // Redirect no longer needed based on auth

export default async function AdminDashboardPage() {
  // Authentication check removed
  // const { isAuthenticated } = await checkAuthStatus();
  // if (!isAuthenticated) {
  //   redirect('/admin/login');
  // }

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Admin Paneli</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Web sitesi yönetimi ve içerik araçlarına buradan ulaşabilirsiniz. (Giriş sistemi devredışı)
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <Newspaper className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Blog Yazısı Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Mevcut blog yazılarınızı yönetin, yenilerini ekleyin veya düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-blog" passHref>
              <Button className="w-full">Blogları Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <FolderKanban className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Proje Yönetimi</CardTitle>
            <CardDescription className="text-center">
              Mevcut projelerinizi yönetin, yenilerini ekleyin veya düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/admin/manage-projects" passHref>
              <Button className="w-full">Projeleri Yönet</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl opacity-50 cursor-not-allowed"> 
          <CardHeader>
             <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Diğer İçerikler</CardTitle>
            <CardDescription className="text-center">
              Portfolyo, hizmetler, referanslar vb. içerikleri yönetin. (Yakında)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" disabled>Eriş</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl opacity-50 cursor-not-allowed"> 
          <CardHeader>
            <div className="flex justify-center mb-4">
                <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl text-center">Site Ayarları</CardTitle>
            <CardDescription className="text-center">
              Genel site ayarlarını ve yapılandırmalarını düzenleyin. (Yakında)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" disabled>Ayarlar</Button>
          </CardContent>
        </Card>
      </section>
       {/* Logout button/form removed
       <section className="text-center mt-12">
        <form action={async () => {
          "use server";
          // await logout();
        }}>
          <Button type="submit" variant="destructive" size="lg">
            <LogOut className="mr-2 h-5 w-5" /> Güvenli Çıkış
          </Button>
        </form>
      </section>
      */}
    </div>
  );
}
