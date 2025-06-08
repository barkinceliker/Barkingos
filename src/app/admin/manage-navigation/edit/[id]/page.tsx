
import NavItemForm from '@/components/admin/forms/NavItemForm';
import { getNavItemById, updateNavItem, type NavItemInput } from '@/lib/actions/navigation-actions';
import { notFound } from 'next/navigation';

interface EditNavItemPageProps {
  params: {
    id: string; // Firestore document ID
  };
}

export default async function EditNavItemPage({ params }: EditNavItemPageProps) {
  const { id } = params;
  const navItem = await getNavItemById(id);

  if (!navItem) {
    notFound();
  }
  
  async function handleUpdateNavItem(data: Omit<NavItemInput, 'id'>, currentId?: string) {
    "use server"; 
    if (!currentId) {
        return { success: false, message: "Güncellenecek navigasyon öğesi ID'si bulunamadı."};
    }
    return updateNavItem(currentId, data); 
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <NavItemForm 
        initialData={navItem} 
        onSubmitAction={handleUpdateNavItem} 
        isEditing={true} 
      />
    </div>
  );
}
