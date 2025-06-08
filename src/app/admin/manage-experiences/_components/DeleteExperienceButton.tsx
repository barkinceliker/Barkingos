
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteExperience } from "@/lib/actions/experience-actions";
import { Trash2 } from "lucide-react";

interface DeleteExperienceButtonProps {
  experienceId: string;
  experienceRole: string; // Or company name for more context
  experienceCompany: string;
}

export default function DeleteExperienceButton({ experienceId, experienceRole, experienceCompany }: DeleteExperienceButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteExperience(experienceId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="deneyimi"
      itemName={`${experienceCompany} şirketindeki "${experienceRole}" rolünü`}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
