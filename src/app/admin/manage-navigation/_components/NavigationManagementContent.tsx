
// This file has been removed as per user request to revert to static navigation.
// If you need to restore dynamic navigation management, please ask or check your version control history.
// This component was used to display and manage dynamic navigation items in the admin panel.

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ListCollapse } from 'lucide-react';

export default async function NavigationManagementContentObsolete() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center">
          <ListCollapse className="mr-3 h-6 w-6" /> Navigasyon Yönetimi (Devre Dışı)
        </CardTitle>
        <CardDescription className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-1" />
          <span>
            Dinamik navigasyon yönetimi kaldırılmıştır. Navigasyon menüsü artık 
            <code>src/components/layout/Header.tsx</code> dosyasındaki <code>staticNavItems</code> dizisinden statik olarak yönetilmektedir.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-10">
        <p className="text-muted-foreground mb-6">
          Navigasyon öğelerini düzenlemek için lütfen ilgili kod dosyasını güncelleyin.
        </p>
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
