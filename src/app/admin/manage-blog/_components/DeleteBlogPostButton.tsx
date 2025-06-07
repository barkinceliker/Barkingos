
"use client";

import DeleteConfirmationDialog from "@/components/admin/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { deleteBlogPost } from "@/lib/actions/blog-actions";
import { Trash2 } from "lucide-react";

interface DeleteBlogPostButtonProps {
  slug: string;
  postTitle: string;
}

export default function DeleteBlogPostButton({ slug, postTitle }: DeleteBlogPostButtonProps) {
  
  const handleDeleteConfirm = async () => {
    // Bu fonksiyon sunucu tarafında çalışacak bir action'ı çağırıyor.
    // "use server" direktifi olmadan doğrudan server action çağrılabilir.
    const result = await deleteBlogPost(slug);
    return result; // success ve message içeren bir obje döndürmeli
  };

  return (
    <DeleteConfirmationDialog
      itemType="blog yazısını"
      itemName={postTitle}
      onConfirm={handleDeleteConfirm}
      triggerButton={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Sil
        </Button>
      }
    />
  );
}
