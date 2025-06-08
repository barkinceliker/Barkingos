
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// Resume Sayfası İçin Arayüz ve Şema
export interface ResumePageContent {
  id?: string; // Firestore document ID, should be 'resume'
  name: string;
  title: string;
  profileImageUrl: string;
  profileImageAiHint: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  location?: string;
  summary: string; // Kısa bir özet veya giriş paragrafı
  experiencesString: string; // Her deneyim bloğu '---' ile ayrılmış, her satır bir özelliği belirtir
  educationString: string; // Her eğitim bloğu '---' ile ayrılmış
  skillsString: string; // Virgülle ayrılmış beceriler
  resumePdfUrl: string;
  updatedAt?: string;
}

const resumePageContentSchema = z.object({
  name: z.string().min(1, "Ad Soyad gereklidir."),
  title: z.string().min(1, "Unvan gereklidir."),
  profileImageUrl: z.string().url("Geçerli bir profil resmi URL'si giriniz.").or(z.literal('')).optional(),
  profileImageAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  phone: z.string().optional(),
  linkedinUrl: z.string().url("Geçerli bir LinkedIn URL'si giriniz.").optional().or(z.literal('')),
  githubUrl: z.string().url("Geçerli bir GitHub URL'si giriniz.").optional().or(z.literal('')),
  location: z.string().optional(),
  summary: z.string().min(1, "Özet gereklidir."),
  experiencesString: z.string().min(1, "Deneyimler gereklidir. Her bir deneyim bloğunu '---' ile ayırın."),
  educationString: z.string().min(1, "Eğitim bilgileri gereklidir. Her bir eğitim bloğunu '---' ile ayırın."),
  skillsString: z.string().min(1, "Beceriler gereklidir (virgülle ayrılmış)."),
  resumePdfUrl: z.string().url("Geçerli bir PDF URL'si giriniz.").or(z.literal('')).optional(),
});

const DEFAULT_RESUME_CONTENT: Omit<ResumePageContent, 'id' | 'updatedAt'> = {
  name: 'Barkın Çeliker', // Güncellendi
  title: 'Kıdemli Yazılım Geliştirici', // Örnek unvan güncellendi
  profileImageUrl: 'https://placehold.co/150x150.png',
  profileImageAiHint: 'professional headshot',
  email: 'mail.barkinclkr@gmail.com', // Örnek e-posta güncellendi
  phone: '05XX XXX XX XX', // Örnek telefon
  linkedinUrl: 'https://linkedin.com/in/celikerbarkin', // Örnek LinkedIn
  githubUrl: 'https://github.com/barkinceliker', // Örnek GitHub
  location: 'İzmir, Türkiye', // Örnek konum
  summary: 'Yazılım geliştirme alanında 5+ yıllık deneyime sahip, yenilikçi çözümler üretmeye odaklı bir profesyonelim. Özellikle web teknolojileri, bulut sistemleri ve yapay zeka konularında projeler geliştirmekteyim.',
  experiencesString: `Rol: Kıdemli Yazılım Geliştirici\nŞirket: Teknoloji Çözümleri A.Ş.\nDönem: Ocak 2021 - Günümüz\n- Ölçeklenebilir web uygulamaları geliştirdim.\n- Yeni özelliklerin tasarım ve dağıtım süreçlerinde rol aldım.\n---\nRol: Yazılım Geliştirici\nŞirket: Startup X\nDönem: Haziran 2018 - Aralık 2020\n- Çevik metodolojilerle ürün geliştirme süreçlerine katıldım.`,
  educationString: `Derece: Bilgisayar Mühendisliği Lisans Derecesi\nÜniversite: Örnek Üniversite\nDönem: Eylül 2014 - Haziran 2018`,
  skillsString: 'React, Next.js, TypeScript, Node.js, Python, SQL, Firebase, Google Cloud, Docker, Problem Çözme',
  resumePdfUrl: '/barkin_celiker_cv.pdf', // Örnek PDF URL
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

const SITE_PAGES_COLLECTION = 'sitePages'; // `hakkimda` ve `anasayfa` ile aynı koleksiyonda
const RESUME_DOCUMENT_ID = 'resume';

export const getResumeContent = cache(async (): Promise<ResumePageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc(RESUME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data() as Partial<ResumePageContent>; // Type assertion
      return {
        id: docSnap.id,
        name: dataFromDb.name || DEFAULT_RESUME_CONTENT.name,
        title: dataFromDb.title || DEFAULT_RESUME_CONTENT.title,
        profileImageUrl: dataFromDb.profileImageUrl || DEFAULT_RESUME_CONTENT.profileImageUrl,
        profileImageAiHint: dataFromDb.profileImageAiHint || DEFAULT_RESUME_CONTENT.profileImageAiHint,
        email: dataFromDb.email || DEFAULT_RESUME_CONTENT.email,
        phone: dataFromDb.phone || DEFAULT_RESUME_CONTENT.phone,
        linkedinUrl: dataFromDb.linkedinUrl || DEFAULT_RESUME_CONTENT.linkedinUrl,
        githubUrl: dataFromDb.githubUrl || DEFAULT_RESUME_CONTENT.githubUrl,
        location: dataFromDb.location || DEFAULT_RESUME_CONTENT.location,
        summary: dataFromDb.summary || DEFAULT_RESUME_CONTENT.summary,
        experiencesString: dataFromDb.experiencesString || DEFAULT_RESUME_CONTENT.experiencesString,
        educationString: dataFromDb.educationString || DEFAULT_RESUME_CONTENT.educationString,
        skillsString: dataFromDb.skillsString || DEFAULT_RESUME_CONTENT.skillsString,
        resumePdfUrl: dataFromDb.resumePdfUrl || DEFAULT_RESUME_CONTENT.resumePdfUrl,
        updatedAt: dataFromDb.updatedAt || new Date().toISOString(),
      };
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_RESUME_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      console.log(`Default resume content created in Firestore for document ID: ${RESUME_DOCUMENT_ID}`);
      return { 
        ...DEFAULT_RESUME_CONTENT, 
        id: RESUME_DOCUMENT_ID, 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating Resume page content:", error);
    return { 
      ...DEFAULT_RESUME_CONTENT, 
      id: RESUME_DOCUMENT_ID, 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateResumeContent(data: Omit<ResumePageContent, 'id' | 'updatedAt'>) {
  const validation = resumePageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }
  
  const dataToSave = { ...validation.data };
  if (dataToSave.profileImageUrl === '') {
    dataToSave.profileImageUrl = DEFAULT_RESUME_CONTENT.profileImageUrl;
  }
  if (dataToSave.profileImageAiHint === '' && dataToSave.profileImageUrl === DEFAULT_RESUME_CONTENT.profileImageUrl) {
    dataToSave.profileImageAiHint = DEFAULT_RESUME_CONTENT.profileImageAiHint;
  }
  if (dataToSave.resumePdfUrl === '') {
    dataToSave.resumePdfUrl = DEFAULT_RESUME_CONTENT.resumePdfUrl;
  }


  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc(RESUME_DOCUMENT_ID);
    await docRef.set({ 
      ...dataToSave, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/resume'); // Public resume page
    revalidatePath('/admin');    // Admin page accordion
    return { success: true, message: 'Özgeçmiş başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating Resume page content:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

    
