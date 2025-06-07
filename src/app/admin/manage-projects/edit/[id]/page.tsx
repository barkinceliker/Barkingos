
import ProjectForm from '@/components/admin/forms/ProjectForm';
import { getProjectByIdFromDb, updateProject, ProjectInput } from '@/lib/actions/project-actions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';

interface EditProjectPageProps {
  params: {
    id: string; // This is the Firestore document ID (user-defined slug)
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = params;
  const project = await getProjectByIdFromDb(id);

  if (!project) {
    notFound();
  }
  
  // updateProject ilk parametre olarak originalId'yi bekliyor (document ID).
  // İkinci parametre ise ProjectInput tipinde veri olmalı.
  async function handleUpdateProject(originalId: string, data: ProjectInput) {
    "use server"; 
    // Proje ID (slug) formda değiştirilemediği için data.id her zaman originalId ile aynı olacak.
    // Bu yüzden updateProject'e doğrudan originalId ve datanın geri kalanını yolluyoruz.
    return updateProject(originalId, data); 
  }

  return (
    <div className="space-y-6">
      <ProjectForm 
        initialData={project} 
        onSubmitAction={handleUpdateProject} 
        isEditing={true} 
      />
    </div>
  );
}

    