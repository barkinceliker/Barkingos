
import NavItemForm from '@/components/admin/navigation/NavItemForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewNavItemPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
        <Link href="/admin/manage-navigation" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Navigasyon Yönetimine Geri Dön
        </Link>
      <NavItemForm />
    </div>
  );
}
