import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Award, Users } from 'lucide-react';

export default function HakkimdaPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Hakkımda</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Benim hikayem, tutkularım ve profesyonel yolculuğum hakkında daha fazla bilgi edinin.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1 flex justify-center">
          <Image
            src="https://placehold.co/400x400.png"
            alt="Benim Profil Fotoğrafım"
            width={300}
            height={300}
            className="rounded-full shadow-lg border-4 border-primary/50 object-cover"
            data-ai-hint="professional portrait"
          />
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Ben Kimim?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <p>
                Merhaba! Ben [Adınız Soyadınız]. Teknolojiye ve tasarıma olan tutkumla, dijital dünyada fark yaratan projeler geliştirmek için buradayım. Yıllar içinde edindiğim bilgi ve deneyimle, kullanıcı odaklı ve estetik açıdan tatmin edici çözümler sunmayı hedefliyorum.
              </p>
              <p>
                Problem çözmeyi, yeni şeyler öğrenmeyi ve yaratıcı süreçlerin bir parçası olmayı seviyorum. Ekip çalışmasına inanıyor ve her projeye pozitif bir enerjiyle yaklaşıyorum.
              </p>
              <p>
                Boş zamanlarımda [Hobilerinizden birkaçı, örneğin: yeni teknolojileri araştırmak, fotoğraf çekmek, doğa yürüyüşleri yapmak] gibi aktivitelerle ilgileniyorum.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Deneyim</h3>
          <p className="text-muted-foreground">[X]+ Yıl Sektör Deneyimi</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Award className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Uzmanlık Alanları</h3>
          <p className="text-muted-foreground">Web Geliştirme, UI/UX Tasarımı, Mobil Uygulamalar</p>
        </Card>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold text-primary mb-2">Takım Çalışması</h3>
          <p className="text-muted-foreground">İşbirlikçi ve Çevik Metodolojilere Hakim</p>
        </Card>
      </section>
      
      <section>
        <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Misyonum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <p>
                Teknolojinin gücünü kullanarak insanların hayatını kolaylaştıran, estetik ve işlevsel ürünler ortaya koymak. Her zaman en son trendleri takip ederek ve kendimi sürekli geliştirerek, projelerime değer katmayı amaçlıyorum.
              </p>
            </CardContent>
          </Card>
      </section>
    </div>
  );
}
