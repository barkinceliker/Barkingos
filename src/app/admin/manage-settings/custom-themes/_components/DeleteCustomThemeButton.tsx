
"use client";

import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteCustomThemeButtonObsolete() {
  return (
    <Button variant="destructive" size="sm" disabled title="Özel tema yönetimi kaldırıldığı için bu özellik devre dışıdır.">
      <AlertTriangle className="mr-1 h-4 w-4" /> Sil (Devre Dışı)
    </Button>
  );
}
