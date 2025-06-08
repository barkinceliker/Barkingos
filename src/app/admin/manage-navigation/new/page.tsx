
import NavItemFormObsolete from '@/components/admin/forms/NavItemForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListChecks, AlertTriangle } from 'lucide-react';

export default function NewNavItemPageObsolete() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-headline text-primary">Yeni Navigasyon Öğesi Sayfası Devre Dışı</CardTitle>
          <CardDescription>
           Dinamik navigasyon yönetimi kaldırıldığı için bu sayfa artık kullanılmamaktadır.
           Navigasyon öğeleri artık doğrudan kod içinde (Header.tsx) statik olarak tanımlanmaktadır.
          </CardDescription>
        </CardHeader>
         <CardContent className="text-center">
            <Link href="/admin">
              <Button variant="outline">Ana Yönetim Paneline Dön</Button>
            </Link>
        </CardContent>
      </Card>
      {/* <NavItemFormObsolete /> // Formu göstermeye gerek yok, zaten işlevsiz */}
    </div>
  );
}
