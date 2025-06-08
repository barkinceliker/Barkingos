
import NavItemForm from '@/components/admin/forms/NavItemForm';
import { createNavItem, type NavItemInput } from '@/lib/actions/navigation-actions';

export default function NewNavItemPage() {
  
  async function handleCreateNavItem(data: Omit<NavItemInput, 'id'>) {
    "use server"; 
    return createNavItem(data); 
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <NavItemForm 
        onSubmitAction={handleCreateNavItem} 
        isEditing={false} 
      />
    </div>
  );
}
