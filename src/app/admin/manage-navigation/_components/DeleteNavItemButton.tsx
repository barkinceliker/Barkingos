
// This file has been removed as per user request to revert to static navigation.
// If you need to restore dynamic navigation management, please ask or check your version control history.
// This component was used to delete dynamic navigation items.

"use client"; // Bu direktif gerekliydi, ancak dosya artık işlevsel değil.

import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteNavItemButtonObsolete() {
  return (
    <Button variant="destructive" size="sm" disabled title="Dinamik navigasyon yönetimi kaldırıldığı için bu özellik devre dışıdır.">
      <AlertTriangle className="mr-1 h-4 w-4" /> Sil (Devre Dışı)
    </Button>
  );
}
