
import ServiceForm from '@/components/admin/forms/ServiceForm';
import { getServiceById, updateService, ServiceInput } from '@/lib/actions/service-actions';
import { notFound } from 'next/navigation';

interface EditServicePageProps {
  params: {
    id: string; // This is the Firestore document ID (user-defined slug)
  };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }
  
  async function handleUpdateService(originalId: string, data: Omit<ServiceInput, 'id'>) {
    "use server"; 
    // ID (slug) is not changeable in the form for editing, so originalId is always the correct one.
    return updateService(originalId, data); 
  }

  return (
    <div className="space-y-6">
      <ServiceForm 
        initialData={service} 
        onSubmitAction={handleUpdateService} 
        isEditing={true} 
      />
    </div>
  );
}
