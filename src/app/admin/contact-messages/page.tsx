
import { getContactMessages, type ContactSubmission } from '@/lib/actions/contact';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale'; // Turkish locale for date-fns

export default async function ViewContactMessagesPage() {
  const messages = await getContactMessages();

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, "dd MMMM yyyy, HH:mm", { locale: tr });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Geçersiz Tarih";
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary">Gelen İletişim Mesajları</h1>
        <p className="text-muted-foreground">Sitenizin iletişim formundan gönderilen mesajları burada görüntüleyebilirsiniz.</p>
      </section>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tüm Mesajlar</CardTitle>
          <CardDescription>Toplam {messages.length} mesaj bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/12">Durum</TableHead>
                <TableHead className="w-2/12">Gönderen</TableHead>
                <TableHead className="w-2/12">E-posta</TableHead>
                <TableHead className="w-2/12">Konu</TableHead>
                <TableHead className="w-3/12">Mesaj (Kısa)</TableHead>
                <TableHead className="w-2/12 text-right">Gönderim Tarihi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>
                    <Badge variant={msg.isRead ? "secondary" : "default"} className={msg.isRead ? "" : "bg-green-500 hover:bg-green-600"}>
                      {msg.isRead ? "Okundu" : "Yeni"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>{msg.subject}</TableCell>
                  <TableCell className="truncate max-w-xs" title={msg.message}>
                    {msg.message.substring(0, 50)}{msg.message.length > 50 ? "..." : ""}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(msg.submittedAt as string)}
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Henüz gönderilmiş bir iletişim mesajı bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
