
import CustomThemeForm from '@/components/admin/forms/CustomThemeForm';
import { createCustomTheme, type CustomThemeInput } from '@/lib/actions/custom-theme-actions';

export default function NewCustomThemePage() {
  
  async function handleCreateCustomTheme(_idIgnored: string | undefined, data: CustomThemeInput) {
    "use server"; 
    // createCustomTheme zaten tüm veriyi (name dahil) data içinde bekliyor.
    // Formdan gelen 'name' alanı, Firestore'da document ID olarak değil, bir field olarak saklanacak.
    // Firestore ID'si otomatik oluşacak.
    return createCustomTheme(data); 
  }

  return (
    <div className="space-y-6">
      <CustomThemeForm 
        onSubmitAction={handleCreateCustomTheme} 
        isEditing={false} 
      />
    </div>
  );
}
