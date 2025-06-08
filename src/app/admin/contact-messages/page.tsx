
// Bu sayfanın içeriği artık /src/app/admin/contact-messages/_components/ContactMessagesTableCard.tsx
// bileşenine taşındı ve /src/app/admin/page.tsx içinde kullanılıyor.
// Bu dosya doğrudan bir sayfa olarak kullanılmayacak.

import ContactMessagesTableCard from "./_components/ContactMessagesTableCard";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactMessagesPageStandalone() {
  return (
    <div className="space-y-8">
       <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Gelen İletişim Mesajları (Eski Sayfa)</h1>
        <p className="text-muted-foreground">
            Bu bölümdeki iletişim mesajları artık ana yönetim panelindeki "Gelen İletişim Mesajları" akordeon bölümünden yönetilmektedir.
        </p>
      </section>
      <ContactMessagesTableCard />
       <div className="text-center mt-8">
        <Link href="/admin">
          <Button variant="outline">Ana Yönetim Paneline Dön</Button>
        </Link>
      </div>
    </div>
  );
}
