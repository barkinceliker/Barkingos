
import SkillForm from '@/components/admin/forms/SkillForm';
import { getSkillById, updateSkill, type SkillInput } from '@/lib/actions/skill-actions';
import { notFound } from 'next/navigation';

interface EditSkillPageProps {
  params: {
    id: string; // Firestore document ID
  };
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = params;
  const skill = await getSkillById(id);

  if (!skill) {
    notFound();
  }
  
  async function handleUpdateSkill(data: Omit<SkillInput, 'id'>, currentId?: string) {
    "use server"; 
    if (!currentId) { // Should always be present for editing
        return { success: false, message: "Güncellenecek yetenek ID'si bulunamadı."};
    }
    return updateSkill(currentId, data); 
  }

  return (
    <div className="space-y-6">
      <SkillForm 
        initialData={skill} 
        onSubmitAction={handleUpdateSkill} 
        isEditing={true} 
      />
    </div>
  );
}
