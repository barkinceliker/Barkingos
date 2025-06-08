
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getAllServices } from '@/lib/actions/service-actions';
import { getLucideIcon } from '@/components/icons/lucide-icon-map';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HizmetlerPage() {
  const services = await getAllServices();

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Hizmetlerim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sunduğum profesyonel hizmetler ve uzmanlık alanlarım hakkında detaylı bilgi.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const IconComponent = getLucideIcon(service.iconName);
          return (
            <Card key={service.id} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-accent/10 rounded-full inline-block mb-4">
                  <IconComponent className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="font-headline text-2xl text-gradient">{service.title}</CardTitle>
                <CardDescription className="mt-1">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-4">
                  {service.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
        {services.length === 0 && (
           <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground text-lg">Henüz tanımlanmış bir hizmet bulunmuyor.</p>
            <Link href="/" passHref>
              <Button variant="link" className="mt-4">Anasayfaya Dön</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
