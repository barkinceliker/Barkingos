
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteCustomTheme } from "@/lib/actions/custom-theme-actions";
import { Trash2 } from "lucide-react";

interface DeleteCustomThemeButtonProps {
  themeId: string;
  themeName: string;
}

export default function DeleteCustomThemeButton({ themeId, themeName }: DeleteCustomThemeButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteCustomTheme(themeId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="özel temayı"
      itemName={themeName}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
