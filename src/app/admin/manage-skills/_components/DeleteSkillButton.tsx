
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteSkill } from "@/lib/actions/skill-actions";
import { Trash2 } from "lucide-react";

interface DeleteSkillButtonProps {
  skillId: string;
  skillName: string;
}

export default function DeleteSkillButton({ skillId, skillName }: DeleteSkillButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteSkill(skillId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="yeteneği"
      itemName={skillName}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
