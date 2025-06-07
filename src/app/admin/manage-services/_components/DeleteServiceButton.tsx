
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteService } from "@/lib/actions/service-actions";
import { Trash2 } from "lucide-react";

interface DeleteServiceButtonProps {
  serviceId: string;
  serviceTitle: string;
}

export default function DeleteServiceButton({ serviceId, serviceTitle }: DeleteServiceButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteService(serviceId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="hizmeti"
      itemName={serviceTitle}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
