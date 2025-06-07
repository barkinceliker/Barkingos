
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions/project-actions";
import { Trash2 } from "lucide-react";

interface DeleteProjectButtonProps {
  projectId: string;
  projectTitle: string;
}

export default function DeleteProjectButton({ projectId, projectTitle }: DeleteProjectButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteProject(projectId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="projeyi"
      itemName={projectTitle}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}

    