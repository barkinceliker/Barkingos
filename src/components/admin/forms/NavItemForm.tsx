
// This file has been removed as per user request to revert to static navigation.
// If you need to restore dynamic navigation management, please ask or check your version control history.
// The content of this form was related to creating/editing dynamic navigation items.

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NavItemFormObsolete() {
  return (
    <Card className="shadow-xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <AlertTriangle className="mr-3 h-7 w-7 text-destructive" />
          Navigasyon Formu Devre Dışı
        </CardTitle>
        <CardDescription>
          Bu form, dinamik navigasyon yönetimi kaldırıldığı için artık kullanılmamaktadır.
          Navigasyon öğeleri artık doğrudan kod içinde (Header.tsx) statik olarak tanımlanmaktadır.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">
          Eğer navigasyon menüsünü değiştirmek istiyorsanız, lütfen 
          <code>src/components/layout/Header.tsx</code> dosyasındaki <code>staticNavItems</code> dizisini güncelleyin.
        </p>
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
