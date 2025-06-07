
import ProjectForm from '@/components/admin/forms/ProjectForm';
import { createProject, ProjectInput } from '@/lib/actions/project-actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProjectPage() {
  
  // createProject artık data: ProjectInput alıyor, id'yi kendisi handle ediyor.
  async function handleCreateProject(_idIgnored: string, data: ProjectInput) {
    "use server"; 
    return createProject(data); 
  }

  return (
    <div className="space-y-6">
      <ProjectForm 
        onSubmitAction={handleCreateProject} 
        isEditing={false} 
      />
    </div>
  );
}

    