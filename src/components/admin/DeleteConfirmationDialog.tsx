
"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface DeleteConfirmationDialogProps {
  triggerButton?: React.ReactNode; // Optional custom trigger
  itemType: string; // e.g., "blog yazısını", "projeyi"
  itemName: string;
  onConfirm: () => Promise<{ success: boolean; message: string }>;
  disabled?: boolean;
}

export default function DeleteConfirmationDialog({
  triggerButton,
  itemType,
  itemName,
  onConfirm,
  disabled = false,
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await onConfirm();
    setIsDeleting(false);
    if (result.success) {
      toast({
        title: "Başarılı!",
        description: result.message,
      });
      setIsOpen(false); // Close dialog on success
    } else {
      toast({
        title: "Hata!",
        description: result.message || "Silme işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {triggerButton ? (
          React.cloneElement(triggerButton as React.ReactElement, { disabled: disabled || isDeleting })
        ) : (
          <Button variant="destructive" size="sm" disabled={disabled || isDeleting}>
            {isDeleting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
            Sil
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu eylem geri alınamaz. "{itemName}" adlı {itemType} kalıcı olarak silinecektir.
            Devam etmek istediğinizden emin misiniz?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Evet, Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
