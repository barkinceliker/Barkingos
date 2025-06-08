
import SkillForm from '@/components/admin/forms/SkillForm';
import { createSkill, type SkillInput } from '@/lib/actions/skill-actions';

export default function NewSkillPage() {
  
  async function handleCreateSkill(data: Omit<SkillInput, 'id'>) {
    "use server"; 
    return createSkill(data); 
  }

  return (
    <div className="space-y-6">
      <SkillForm 
        onSubmitAction={handleCreateSkill} 
        isEditing={false} 
      />
    </div>
  );
}
