
import ExperienceForm from '@/components/admin/forms/ExperienceForm';
import { getExperienceById, updateExperience, type ExperienceInput } from '@/lib/actions/experience-actions';
import { notFound } from 'next/navigation';

interface EditExperiencePageProps {
  params: {
    id: string; // Firestore document ID
  };
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const { id } = params;
  const experience = await getExperienceById(id);

  if (!experience) {
    notFound();
  }
  
  async function handleUpdateExperience(data: Omit<ExperienceInput, 'id'>, currentId?: string) {
    "use server"; 
    if (!currentId) { // Should always be present for editing as it's passed from the form component
        return { success: false, message: "Güncellenecek deneyim ID'si bulunamadı."};
    }
    return updateExperience(currentId, data); 
  }

  return (
    <div className="space-y-6">
      <ExperienceForm 
        initialData={experience} 
        onSubmitAction={handleUpdateExperience} 
        isEditing={true} 
      />
    </div>
  );
}

