'use client';

import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteNavItem, NavigationItem } from '@/lib/navigation-data';
import { useRouter } from 'next/navigation';

interface NavItemsTableActionsProps {
  item: NavigationItem;
}

export default function NavItemsTableActions({ item }: NavItemsTableActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteNavItem(item.id);
      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: `"${item.label}" adlı öğe silindi.`,
        });
        router.refresh(); // Refresh the page to reflect changes
      } else {
        toast({
          title: 'Hata!',
          description: result.error || 'Öğe silinirken bir hata oluştu.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sunucu Hatası!',
        description: 'Silme işlemi sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-x-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/manage-navigation/edit/${item.id}`}>
          <Pencil className="mr-1 h-4 w-4" /> Düzenle
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
            Sil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{item.label}" adlı navigasyon öğesini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
    </div>
  );
}
