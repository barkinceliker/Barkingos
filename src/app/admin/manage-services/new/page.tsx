
import ServiceForm from '@/components/admin/forms/ServiceForm';
import { createService, ServiceInput } from '@/lib/actions/service-actions';

export default function NewServicePage() {
  
  async function handleCreateService(idIgnored: string, data: Omit<ServiceInput, 'id'> & { id?: string }) {
    "use server";
    // ServiceForm passes id in the first param if it's new, we need to take it from data.id for createService
    const serviceId = form.getValues("id"); // This is a client component call, can't use it here.
                                      // The form component now expects id as the first param.
                                      // The action `createService` needs `id` in its `data` param.
    
    // The `id` should be part of the `data` object for `createService` as per its definition.
    // The `ServiceForm` onSubmitAction signature is (id: string, data: Omit<ServiceInput, 'id'>)
    // This means the `id` is the first param from the form submission.
    // We need to make sure `createService` accepts data with `id` in it.

    if (!data.id) { // Ensure id is present for createService. The form should ensure this.
        return { success: false, message: "Hizmet ID (slug) oluşturulamadı veya eksik." };
    }

    // Correctly structure the data for createService
    const servicePayload: Omit<ServiceInput, 'id'> & { id: string } = {
      id: data.id, // This is the slug passed from form
      title: data.title,
      description: data.description,
      iconName: data.iconName,
      details: data.details,
    };
    return createService(servicePayload);
  }

  return (
    <div className="space-y-6">
      <ServiceForm 
        onSubmitAction={
          // The ServiceForm expects an action that takes (id: string, data: Omit<ServiceInput, 'id'>)
          // where `id` is the first parameter (the slug from the form)
          // and `data` is the rest of the service data.
          // `createService` expects (data: Omit<ServiceInput, 'id'> & { id: string })
          async (formId: string, formData: Omit<ServiceInput, 'id'>) => {
            "use server";
            const payloadForCreate: Omit<ServiceInput, 'id'> & { id: string } = {
              id: formId, // Use the slug from the form as the id
              ...formData
            };
            return createService(payloadForCreate);
          }
        } 
        isEditing={false} 
      />
    </div>
  );
}
