
import CustomThemeForm from '@/components/admin/forms/CustomThemeForm';
import { getCustomThemeById, updateCustomTheme, type CustomThemeInput, type CustomTheme } from '@/lib/actions/custom-theme-actions';
import { notFound } from 'next/navigation';

interface EditCustomThemePageProps {
  params: {
    id: string; // Firestore document ID
  };
}

export default async function EditCustomThemePage({ params }: EditCustomThemePageProps) {
  const { id } = params;
  const theme = await getCustomThemeById(id);

  if (!theme) {
    notFound();
  }
  
  async function handleUpdateCustomTheme(currentId: string | undefined, data: CustomThemeInput) {
    "use server"; 
    if (!currentId) {
        return { success: false, message: "Güncellenecek tema ID'si bulunamadı."};
    }
    // updateCustomTheme, Firestore ID'sini ve güncellenecek veriyi (CustomThemeInput) alır.
    // CustomThemeInput, Zod şemasından türetildiği için 'name' ve 'displayName' içerir.
    return updateCustomTheme(currentId, data); 
  }

  // initialData'yı forma CustomTheme & { id: string } olarak yolla
  const initialFormData: CustomTheme & { id: string } = {
    ...theme,
    id: theme.id!, // getCustomThemeById zaten id'yi ekliyor
  };


  return (
    <div className="space-y-6">
      <CustomThemeForm 
        initialData={initialFormData} 
        onSubmitAction={handleUpdateCustomTheme} 
        isEditing={true} 
      />
    </div>
  );
}
