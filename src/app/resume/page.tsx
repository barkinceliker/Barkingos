
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Award, Briefcase, GraduationCap } from 'lucide-react';
import Image from 'next/image';

export default function ResumePage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-gradient mb-4">Özgeçmişim</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Profesyonel deneyimlerimi, eğitim bilgilerimi ve yeteneklerimi içeren detaylı özgeçmişim.
        </p>
      </section>

      <Card className="max-w-3xl mx-auto shadow-xl p-6 md:p-8">
        <CardHeader className="text-center mb-6">
          <Image
            src="https://placehold.co/150x150.png"
            alt="Profil Fotoğrafı"
            width={150}
            height={150}
            className="rounded-full mx-auto mb-4 border-4 border-primary/30"
            data-ai-hint="professional headshot"
          />
          <CardTitle className="font-headline text-3xl text-gradient">[Adınız Soyadınız]</CardTitle>
          <p className="text-xl text-accent">[Unvanınız, örn: Kıdemli Yazılım Geliştirici]</p>
        </CardHeader>

        <CardContent className="space-y-8">
          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <Briefcase className="mr-3 h-6 w-6 text-accent" /> Deneyimlerim
            </h2>
            <div className="space-y-4 border-l-2 border-accent pl-4 ml-3">
              {/* Örnek Deneyim */}
              <div>
                <h3 className="font-semibold text-lg">Kıdemli Yazılım Geliştirici</h3>
                <p className="text-muted-foreground">Teknoloji Çözümleri A.Ş. | Ocak 2021 - Günümüz</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Ölçeklenebilir web uygulamaları geliştirdim.</li>
                  <li>Yeni özelliklerin tasarım ve dağıtım süreçlerinde rol aldım.</li>
                </ul>
              </div>
              {/* Diğer deneyimleri buraya ekleyebilirsiniz */}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <GraduationCap className="mr-3 h-6 w-6 text-accent" /> Eğitimim
            </h2>
            <div className="space-y-4 border-l-2 border-accent pl-4 ml-3">
              {/* Örnek Eğitim */}
              <div>
                <h3 className="font-semibold text-lg">Bilgisayar Mühendisliği Lisans Derecesi</h3>
                <p className="text-muted-foreground">Örnek Üniversite | Eylül 2014 - Haziran 2018</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold text-gradient mb-3 flex items-center">
              <Award className="mr-3 h-6 w-6 text-accent" /> Yetenekler
            </h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'SQL', 'UI/UX Tasarımı', 'Problem Çözme'].map(skill => (
                <span key={skill} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </section>

          <div className="text-center pt-8">
            <a href="/resume-placeholder.pdf" download="Isim_Soyisim_CV.pdf">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Download className="mr-2 h-5 w-5" /> Özgeçmişi İndir (PDF)
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-2">(Bu bir placeholder linkidir.)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
