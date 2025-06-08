
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

export interface SkillInput {
  id?: string; // Firestore document ID (auto-generated)
  name: string;
  proficiency: number; // Percentage 0-100
  category: string;
  iconName?: string; // Lucide icon name, e.g., "Code", "Database"
}

const skillSchema = z.object({
  name: z.string().min(1, "Yetenek adı gereklidir."),
  proficiency: z.number().min(0, "Yetkinlik 0'dan küçük olamaz.").max(100, "Yetkinlik 100'den büyük olamaz."),
  category: z.string().min(1, "Kategori gereklidir."),
  iconName: z.string().optional(),
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

const SKILLS_COLLECTION = 'skills';

export const getAllSkills = cache(async (): Promise<Array<SkillInput & { id: string }>> => {
  try {
    const db = await getDb();
    // Kategoriye ve ardından ada göre sıralama yapabiliriz.
    const snapshot = await db.collection(SKILLS_COLLECTION).orderBy('category', 'asc').orderBy('name', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillInput & { id: string }));
  } catch (error) {
    console.error("Error fetching all skills from DB:", error);
    return [];
  }
});

export const getSkillById = cache(async (id: string): Promise<(SkillInput & { id: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SKILLS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as SkillInput & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching skill by ID ${id} from DB:`, error);
    return null;
  }
});

export async function createSkill(data: Omit<SkillInput, 'id'>) {
  const validation = skillSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  try {
    const db = await getDb();
    const docRef = await db.collection(SKILLS_COLLECTION).add({
      ...validation.data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/manage-skills');
    revalidatePath('/yetenekler');
    return { success: true, message: 'Yetenek başarıyla oluşturuldu.', id: docRef.id };
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateSkill(id: string, data: Partial<Omit<SkillInput, 'id'>>) {
   const updateSchema = skillSchema.partial();
 
   const validation = updateSchema.safeParse(data);
   if (!validation.success) {
     return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
   }
   
   const updateData = validation.data;

  try {
    const db = await getDb();
    const docRef = db.collection(SKILLS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek yetenek bulunamadı." };
    }

    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-skills');
    revalidatePath('/yetenekler');
    revalidatePath(`/admin/manage-skills/edit/${id}`);
    return { success: true, message: 'Yetenek başarıyla güncellendi.', id: id };
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteSkill(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(SKILLS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek yetenek bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-skills');
    revalidatePath('/yetenekler');
    return { success: true, message: 'Yetenek başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
