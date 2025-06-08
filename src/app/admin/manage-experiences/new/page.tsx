
import ExperienceForm from '@/components/admin/forms/ExperienceForm';
import { createExperience, type ExperienceInput } from '@/lib/actions/experience-actions';

export default function NewExperiencePage() {
  
  async function handleCreateExperience(data: Omit<ExperienceInput, 'id'>) {
    "use server"; 
    return createExperience(data); 
  }

  return (
    <div className="space-y-6">
      <ExperienceForm 
        onSubmitAction={handleCreateExperience} 
        isEditing={false} 
      />
    </div>
  );
}
