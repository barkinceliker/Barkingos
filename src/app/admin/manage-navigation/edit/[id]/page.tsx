
import NavItemFormObsolete from '@/components/admin/forms/NavItemForm';
import { notFound } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

// Bu sayfa dinamik navigasyon kaldırıldığı için artık işlevsel değil.
// Kullanıcıyı bilgilendirmek için bir mesaj gösterilebilir.

interface EditNavItemPageObsoleteProps {
  params: {
    id: string; 
  };
}

export default async function EditNavItemPageObsolete({ params }: EditNavItemPageObsoleteProps) {
  // const { id } = params;
  // Dinamik navigasyon kaldırıldığı için veri çekmeye gerek yok.

  return (
    <div className="space-y-6 p-4 md:p-8">
       <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-headline text-primary">Navigasyon Öğesi Düzenleme Sayfası Devre Dışı</CardTitle>
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
