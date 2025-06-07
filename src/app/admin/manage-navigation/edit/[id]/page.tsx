
import NavItemForm from '@/components/admin/navigation/NavItemForm';
import { getNavItemById } from '@/lib/navigation-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditNavItemPage({ params }: { params: { id: string } }) {
  const navItem = await getNavItemById(params.id);

  if (!navItem) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link href="/admin/manage-navigation" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Navigasyon Yönetimine Geri Dön
      </Link>
      <NavItemForm initialData={navItem} />
    </div>
  );
}
