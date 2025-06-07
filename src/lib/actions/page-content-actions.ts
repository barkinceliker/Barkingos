
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin'; // Using existing firebaseAdmin
import { cache } from 'react';

export interface HakkimdaPageContent {
  id?: string; // Firestore document ID, should be 'hakkimda'
  pageTitle: string;
  pageSubtitle: string;
  profileImageUrl: string;
  profileImageAiHint: string;
  whoAmI_p1: string;
  whoAmI_p2: string;
  whoAmI_p3_hobbies: string;
  stat_experience_value: string;
  stat_expertise_value: string;
  stat_teamwork_value: string;
  mission_title: string;
  mission_p1: string;
  updatedAt?: admin.firestore.Timestamp;
}

const hakkimdaPageContentSchema = z.object({
  pageTitle: z.string().min(1, "Sayfa başlığı gereklidir."),
  pageSubtitle: z.string().min(1, "Sayfa alt başlığı gereklidir."),
  profileImageUrl: z.string().url("Geçerli bir profil resmi URL'si giriniz.").or(z.literal('')),
  profileImageAiHint: z.string().optional(),
  whoAmI_p1: z.string().min(1, "Ben kimim? ilk paragraf gereklidir."),
  whoAmI_p2: z.string().optional(),
  whoAmI_p3_hobbies: z.string().optional(),
  stat_experience_value: z.string().min(1, "Deneyim süresi gereklidir."),
  stat_expertise_value: z.string().min(1, "Uzmanlık alanları gereklidir."),
  stat_teamwork_value: z.string().min(1, "Takım çalışması açıklaması gereklidir."),
  mission_title: z.string().min(1, "Misyon başlığı gereklidir."),
  mission_p1: z.string().min(1, "Misyon paragrafı gereklidir."),
});

const DEFAULT_HAKKIMDA_CONTENT: HakkimdaPageContent = {
  pageTitle: 'Hakkımda',
  pageSubtitle: 'Benim hikayem, tutkularım ve profesyonel yolculuğum hakkında daha fazla bilgi edinin.',
  profileImageUrl: 'https://placehold.co/400x400.png',
  profileImageAiHint: 'professional portrait',
  whoAmI_p1: 'Merhaba! Ben [Adınız Soyadınız]. Teknolojiye ve tasarıma olan tutkumla, dijital dünyada fark yaratan projeler geliştirmek için buradayım. Yıllar içinde edindiğim bilgi ve deneyimle, kullanıcı odaklı ve estetik açıdan tatmin edici çözümler sunmayı hedefliyorum.',
  whoAmI_p2: 'Problem çözmeyi, yeni şeyler öğrenmeyi ve yaratıcı süreçlerin bir parçası olmayı seviyorum. Ekip çalışmasına inanıyor ve her projeye pozitif bir enerjiyle yaklaşıyorum.',
  whoAmI_p3_hobbies: 'Boş zamanlarımda [Hobilerinizden birkaçı, örneğin: yeni teknolojileri araştırmak, fotoğraf çekmek, doğa yürüyüşleri yapmak] gibi aktivitelerle ilgileniyorum.',
  stat_experience_value: '[X]+ Yıl Sektör Deneyimi',
  stat_expertise_value: 'Web Geliştirme, UI/UX Tasarımı, Mobil Uygulamalar',
  stat_teamwork_value: 'İşbirlikçi ve Çevik Metodolojilere Hakim',
  mission_title: 'Misyonum',
  mission_p1: 'Teknolojinin gücünü kullanarak insanların hayatını kolaylaştıran, estetik ve işlevsel ürünler ortaya koymak. Her zaman en son trendleri takip ederek ve kendimi sürekli geliştirerek, projelerime değer katmayı amaçlıyorum.',
};

async function getDb() {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    throw new Error(`Sunucu yapılandırma hatası (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    throw new Error("Firebase Admin SDK (admin.firestore) düzgün başlatılamadı.");
  }
  return admin.firestore();
}

export const getHakkimdaContent = cache(async (): Promise<HakkimdaPageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection('sitePages').doc('hakkimda');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as HakkimdaPageContent;
      return { ...data, id: docSnap.id };
    } else {
      // Create default content if it doesn't exist
      await docRef.set({ ...DEFAULT_HAKKIMDA_CONTENT, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log("Created default 'hakkimda' page content in Firestore.");
      return { ...DEFAULT_HAKKIMDA_CONTENT, id: 'hakkimda' };
    }
  } catch (error) {
    console.error("Error fetching/creating Hakkimda page content:", error);
    // Fallback to default content in case of error, but log it.
    // This prevents the page from breaking if Firestore is temporarily unavailable.
    return { ...DEFAULT_HAKKIMDA_CONTENT, id: 'hakkimda' };
  }
});

export async function updateHakkimdaContent(data: HakkimdaPageContent) {
  const validation = hakkimdaPageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection('sitePages').doc('hakkimda');
    await docRef.set({ 
      ...validation.data, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    return { success: true, message: 'Hakkımda sayfası başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating Hakkimda page content:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
