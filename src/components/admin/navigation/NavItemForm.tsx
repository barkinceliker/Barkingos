'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { addNavItem, updateNavItem, NavigationItem } from '@/lib/navigation-data';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  label: z.string().min(2, 'Etiket en az 2 karakter olmalıdır.'),
  href: z.string().min(1, 'Link boş olamaz. Anasayfa için "/" kullanın.'),
  iconName: z.string().optional().describe('Lucide icon adı (örn: Home, User). Büyük/küçük harf duyarlı olabilir.'),
  order: z.coerce.number().int('Sıra bir tam sayı olmalıdır.').min(0, 'Sıra 0 veya daha büyük olmalıdır.'),
  isVisible: z.boolean().default(true),
});

type NavItemFormValues = z.infer<typeof formSchema>;

interface NavItemFormProps {
  initialData?: NavigationItem | null;
  onFormSubmit?: () => void; // Callback to refresh data or close modal
}

export default function NavItemForm({ initialData, onFormSubmit }: NavItemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NavItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          label: initialData.label,
          href: initialData.href,
          iconName: initialData.iconName || '',
          order: initialData.order,
          isVisible: initialData.isVisible,
        }
      : {
          label: '',
          href: '',
          iconName: '',
          order: 0,
          isVisible: true,
        },
  });

  async function onSubmit(values: NavItemFormValues) {
    setIsSubmitting(true);
    try {
      let result;
      if (initialData?.id) {
        result = await updateNavItem(initialData.id, values);
      } else {
        result = await addNavItem(values);
      }

      if (result.success) {
        toast({
          title: 'Başarılı!',
          description: `Navigasyon öğesi başarıyla ${initialData?.id ? 'güncellendi' : 'eklendi'}.`,
        });
        form.reset();
        if (onFormSubmit) {
            onFormSubmit();
        } else {
            router.push('/admin/manage-navigation'); // Navigate back or refresh
            router.refresh();
        }
      } else {
        toast({
          title: 'Hata!',
          description: result.error || 'Bir hata oluştu.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sunucu Hatası!',
        description: 'İşlem sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Navigasyon Öğesini Düzenle' : 'Yeni Navigasyon Öğesi Ekle'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiket</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Anasayfa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (href)</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: /hakkimda veya https://site.com" {...field} />
                  </FormControl>
                  <FormDescription>Site içi linkler için / ile başlayın (örn: /blog). Dış linkler için tam URL kullanın.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İkon Adı (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Lucide İkon Adı (örn: Home, Settings)" {...field} />
                  </FormControl>
                  <FormDescription><a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide Icons</a> listesinden bir isim girin (örn: User, Briefcase).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sıra</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>Düşük sayılar önce gelir.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Görünür</FormLabel>
                    <FormDescription>Bu öğe navigasyonda gösterilsin mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
                {onFormSubmit && <Button type="button" variant="outline" onClick={onFormSubmit} disabled={isSubmitting}>İptal</Button>}
                 <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
