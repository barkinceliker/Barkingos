
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// Hakkımda Sayfası İçin Arayüz ve Şema
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
  updatedAt?: string;
}

const hakkimdaPageContentSchema = z.object({
  pageTitle: z.string().min(1, "Sayfa başlığı gereklidir."),
  pageSubtitle: z.string().min(1, "Sayfa alt başlığı gereklidir."),
  profileImageUrl: z.string().url("Geçerli bir profil resmi URL'si giriniz.").or(z.literal('')).optional(),
  profileImageAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
  whoAmI_p1: z.string().min(1, "Ben kimim? ilk paragraf gereklidir."),
  whoAmI_p2: z.string().optional(),
  whoAmI_p3_hobbies: z.string().optional(),
  stat_experience_value: z.string().min(1, "Deneyim süresi gereklidir."),
  stat_expertise_value: z.string().min(1, "Uzmanlık alanları gereklidir."),
  stat_teamwork_value: z.string().min(1, "Takım çalışması açıklaması gereklidir."),
  mission_title: z.string().min(1, "Misyon başlığı gereklidir."),
  mission_p1: z.string().min(1, "Misyon paragrafı gereklidir."),
});

const DEFAULT_HAKKIMDA_CONTENT: Omit<HakkimdaPageContent, 'id' | 'updatedAt'> = {
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

// Anasayfa İçeriği İçin Arayüz ve Şema
export interface HomepageContent {
  id?: string; // Firestore document ID, should be 'anasayfa'
  heroTitle: string;
  heroSubtitle: string;
  aboutSnippetTitle: string;
  aboutSnippetDescription: string;
  recentProjectsTitle: string;
  recentBlogPostsTitle: string;
  updatedAt?: string;
}

const homepageContentSchema = z.object({
  heroTitle: z.string().min(1, "Hero başlığı gereklidir."),
  heroSubtitle: z.string().min(1, "Hero alt başlığı gereklidir."),
  aboutSnippetTitle: z.string().min(1, "'Kısaca Ben' bölüm başlığı gereklidir."),
  aboutSnippetDescription: z.string().min(1, "'Kısaca Ben' bölüm açıklaması gereklidir."),
  recentProjectsTitle: z.string().min(1, "'Son Projelerim' bölüm başlığı gereklidir."),
  recentBlogPostsTitle: z.string().min(1, "'Son Blog Yazıları' bölüm başlığı gereklidir."),
});

const DEFAULT_HOMEPAGE_CONTENT: Omit<HomepageContent, 'id' | 'updatedAt'> = {
  heroTitle: "Merhaba, Ben İsim Soyisim",
  heroSubtitle: "Tutkulu bir geliştirici ve tasarımcıyım. Web teknolojileriyle harika kullanıcı deneyimleri oluşturuyorum. Portfolyomu keşfedin ve projelerim hakkında daha fazla bilgi edinin.",
  aboutSnippetTitle: "Kısaca Ben",
  aboutSnippetDescription: "Yenilikçi çözümler üretmeye ve karmaşık problemleri çözmeye adanmış biriyim. Sürekli öğrenmeye ve kendimi geliştirmeye odaklanıyorum.",
  recentProjectsTitle: "Son Projelerim",
  recentBlogPostsTitle: "Son Blog Yazıları",
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

const SITE_PAGES_COLLECTION = 'sitePages';

// Hakkımda Sayfası Fonksiyonları
export const getHakkimdaContent = cache(async (): Promise<HakkimdaPageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('hakkimda');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data();
      const content: HakkimdaPageContent = {
        id: docSnap.id,
        pageTitle: dataFromDb?.pageTitle || DEFAULT_HAKKIMDA_CONTENT.pageTitle,
        pageSubtitle: dataFromDb?.pageSubtitle || DEFAULT_HAKKIMDA_CONTENT.pageSubtitle,
        profileImageUrl: dataFromDb?.profileImageUrl || DEFAULT_HAKKIMDA_CONTENT.profileImageUrl,
        profileImageAiHint: dataFromDb?.profileImageAiHint || DEFAULT_HAKKIMDA_CONTENT.profileImageAiHint,
        whoAmI_p1: dataFromDb?.whoAmI_p1 || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p1,
        whoAmI_p2: dataFromDb?.whoAmI_p2 || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p2,
        whoAmI_p3_hobbies: dataFromDb?.whoAmI_p3_hobbies || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p3_hobbies,
        stat_experience_value: dataFromDb?.stat_experience_value || DEFAULT_HAKKIMDA_CONTENT.stat_experience_value,
        stat_expertise_value: dataFromDb?.stat_expertise_value || DEFAULT_HAKKIMDA_CONTENT.stat_expertise_value,
        stat_teamwork_value: dataFromDb?.stat_teamwork_value || DEFAULT_HAKKIMDA_CONTENT.stat_teamwork_value,
        mission_title: dataFromDb?.mission_title || DEFAULT_HAKKIMDA_CONTENT.mission_title,
        mission_p1: dataFromDb?.mission_p1 || DEFAULT_HAKKIMDA_CONTENT.mission_p1,
        updatedAt: dataFromDb?.updatedAt && typeof dataFromDb.updatedAt.toDate === 'function' 
                   ? (dataFromDb.updatedAt as admin.firestore.Timestamp).toDate().toISOString() 
                   : new Date().toISOString(),
      };
      return content;
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_HAKKIMDA_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      return { 
        ...DEFAULT_HAKKIMDA_CONTENT, 
        id: 'hakkimda', 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating Hakkimda page content:", error);
    return { 
      ...DEFAULT_HAKKIMDA_CONTENT, 
      id: 'hakkimda', 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateHakkimdaContent(data: Omit<HakkimdaPageContent, 'id' | 'updatedAt'>) {
  const validation = hakkimdaPageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }
  const dataToSave = { ...validation.data };
  if (dataToSave.profileImageUrl === '') {
    dataToSave.profileImageUrl = 'https://placehold.co/400x400.png';
  }
  if (dataToSave.profileImageAiHint === '' && dataToSave.profileImageUrl === 'https://placehold.co/400x400.png') {
    dataToSave.profileImageAiHint = 'placeholder image';
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('hakkimda');
    await docRef.set({ 
      ...dataToSave, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/hakkimda');
    revalidatePath('/admin/manage-content/hakkimda');
    return { success: true, message: 'Hakkımda sayfası başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating Hakkimda page content:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

// Anasayfa Fonksiyonları
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('anasayfa');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data();
      const content: HomepageContent = {
        id: docSnap.id,
        heroTitle: dataFromDb?.heroTitle || DEFAULT_HOMEPAGE_CONTENT.heroTitle,
        heroSubtitle: dataFromDb?.heroSubtitle || DEFAULT_HOMEPAGE_CONTENT.heroSubtitle,
        aboutSnippetTitle: dataFromDb?.aboutSnippetTitle || DEFAULT_HOMEPAGE_CONTENT.aboutSnippetTitle,
        aboutSnippetDescription: dataFromDb?.aboutSnippetDescription || DEFAULT_HOMEPAGE_CONTENT.aboutSnippetDescription,
        recentProjectsTitle: dataFromDb?.recentProjectsTitle || DEFAULT_HOMEPAGE_CONTENT.recentProjectsTitle,
        recentBlogPostsTitle: dataFromDb?.recentBlogPostsTitle || DEFAULT_HOMEPAGE_CONTENT.recentBlogPostsTitle,
        updatedAt: dataFromDb?.updatedAt && typeof dataFromDb.updatedAt.toDate === 'function' 
                   ? (dataFromDb.updatedAt as admin.firestore.Timestamp).toDate().toISOString() 
                   : new Date().toISOString(),
      };
      return content;
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_HOMEPAGE_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      return { 
        ...DEFAULT_HOMEPAGE_CONTENT, 
        id: 'anasayfa', 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating Homepage content:", error);
    return { 
      ...DEFAULT_HOMEPAGE_CONTENT, 
      id: 'anasayfa', 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateHomepageContent(data: Omit<HomepageContent, 'id' | 'updatedAt'>) {
  const validation = homepageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('anasayfa');
    await docRef.set({ 
      ...validation.data, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/'); // Anasayfayı revalidate et
    revalidatePath('/admin/manage-content/anasayfa');
    return { success: true, message: 'Anasayfa içeriği başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating Homepage content:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
    
