
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteNavItem } from "@/lib/actions/navigation-actions";
import { Trash2 } from "lucide-react";

interface DeleteNavItemButtonProps {
  navItemId: string;
  navItemLabel: string;
}

export default function DeleteNavItemButton({ navItemId, navItemLabel }: DeleteNavItemButtonProps) {
  
  const handleDeleteConfirm = async () => {
    const result = await deleteNavItem(navItemId);
    return result; 
  };

  return (
    <DeleteConfirmationDialog
      itemType="navigasyon öğesini"
      itemName={navItemLabel}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
