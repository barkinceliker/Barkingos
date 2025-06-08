
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

export interface ExperienceInput {
  id?: string; // Firestore document ID (auto-generated)
  company: string;
  role: string;
  dates: string; // e.g., "Ocak 2021 - Günümüz"
  location: string;
  description: string[]; // Array of strings for bullet points
  logoUrl?: string;
  dataAiHint?: string;
  // Optional order field if manual sorting is needed, otherwise use createdAt or a date field
  // order?: number; 
}

const experienceSchema = z.object({
  company: z.string().min(1, "Şirket adı gereklidir."),
  role: z.string().min(1, "Pozisyon gereklidir."),
  dates: z.string().min(1, "Tarih aralığı gereklidir."),
  location: z.string().min(1, "Lokasyon gereklidir."),
  description: z.array(z.string().min(1, "Açıklama maddesi boş olamaz.")).min(1, "En az bir açıklama maddesi gereklidir."),
  logoUrl: z.string().url("Geçerli bir logo URL'si giriniz.").or(z.literal('')).optional(),
  dataAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
});

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

const EXPERIENCES_COLLECTION = 'experiences';

export const getAllExperiences = cache(async (): Promise<Array<ExperienceInput & { id: string }>> => {
  try {
    const db = await getDb();
    // Tarihe göre sıralama yapmak için 'dates' alanını parse etmek veya ayrı bir 'startDate' alanı kullanmak gerekebilir.
    // Şimdilik eklenme tarihine göre (veya manuel bir 'order' alanına göre) sıralayabiliriz.
    // Firestore'da 'dates' string olduğu için doğrudan sıralama mantıklı sonuç vermeyebilir.
    // `createdAt` veya `updatedAt` ile sıralama daha güvenilir olur. Veya 'company' adına göre.
    const snapshot = await db.collection(EXPERIENCES_COLLECTION)
                           .orderBy('createdAt', 'desc') // Veya 'company', 'asc'
                           .get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            // Ensure description is always an array, even if Firestore returns undefined/null
            description: Array.isArray(data.description) ? data.description : [],
        } as ExperienceInput & { id: string };
    });
  } catch (error) {
    console.error("Error fetching all experiences from DB:", error);
    return [];
  }
});

export const getExperienceById = cache(async (id: string): Promise<(ExperienceInput & { id: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(EXPERIENCES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        description: Array.isArray(data?.description) ? data.description : [],
      } as ExperienceInput & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching experience by ID ${id} from DB:`, error);
    return null;
  }
});

export async function createExperience(data: Omit<ExperienceInput, 'id'>) {
  const validation = experienceSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  const dataToSave = { ...validation.data };
  if (!dataToSave.logoUrl) {
    dataToSave.logoUrl = `https://placehold.co/100x100.png?text=${dataToSave.company.substring(0,3).toUpperCase()}`;
  }
  if (!dataToSave.dataAiHint && dataToSave.logoUrl?.includes('placehold.co')) {
      dataToSave.dataAiHint = 'company logo';
  }


  try {
    const db = await getDb();
    const docRef = await db.collection(EXPERIENCES_COLLECTION).add({
      ...dataToSave,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/manage-experiences');
    revalidatePath('/deneyim');
    return { success: true, message: 'Deneyim başarıyla oluşturuldu.', id: docRef.id };
  } catch (error: any) {
    console.error("Error creating experience:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateExperience(id: string, data: Partial<Omit<ExperienceInput, 'id'>>) {
   const updateSchema = experienceSchema.partial();
 
   const validation = updateSchema.safeParse(data);
   if (!validation.success) {
     return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
   }
   
   const dataToUpdate = { ...validation.data };
    if (dataToUpdate.logoUrl === '') { // Eğer boş string geldiyse placeholder'a çevir
        dataToUpdate.logoUrl = `https://placehold.co/100x100.png?text=${dataToUpdate.company ? dataToUpdate.company.substring(0,3).toUpperCase() : 'LOGO'}`;
    }
    if (dataToUpdate.dataAiHint === '' && dataToUpdate.logoUrl?.includes('placehold.co')) {
        dataToUpdate.dataAiHint = 'company logo';
    }


  try {
    const db = await getDb();
    const docRef = db.collection(EXPERIENCES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek deneyim bulunamadı." };
    }

    await docRef.update({
      ...dataToUpdate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-experiences');
    revalidatePath('/deneyim');
    revalidatePath(`/admin/manage-experiences/edit/${id}`);
    return { success: true, message: 'Deneyim başarıyla güncellendi.', id: id };
  } catch (error: any) {
    console.error("Error updating experience:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteExperience(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(EXPERIENCES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek deneyim bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-experiences');
    revalidatePath('/deneyim');
    return { success: true, message: 'Deneyim başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting experience:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

