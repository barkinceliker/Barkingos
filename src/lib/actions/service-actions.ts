
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { خدمات } from 'lucide-react'; // Assuming 'Sparkles' or similar for services

export interface ServiceInput {
  id: string; // User-defined slug-like ID, will be Firestore document ID
  title: string;
  description: string;
  iconName: string; // Lucide icon name e.g., "Code", "Palette"
  details: string[]; // Array of strings, each representing a detail point
}

const serviceSchema = z.object({
  id: z.string().min(1, "Hizmet ID (slug) gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID sadece küçük harf, rakam ve tire içerebilir."),
  title: z.string().min(1, "Başlık gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  iconName: z.string().min(1, "İkon adı gereklidir.").default('Settings'), // Default icon if not provided
  details: z.array(z.string()).min(1, "En az bir detay gereklidir."),
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

const SERVICES_COLLECTION = 'services';

export const getAllServices = cache(async (): Promise<Array<ServiceInput & { firestoreId: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(SERVICES_COLLECTION).orderBy('title', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, firestoreId: doc.id } as ServiceInput & { firestoreId: string }));
  } catch (error) {
    console.error("Error fetching all services from DB:", error);
    return [];
  }
});

export const getServiceById = cache(async (id: string): Promise<(ServiceInput & { firestoreId: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SERVICES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { ...docSnap.data(), id: docSnap.id, firestoreId: docSnap.id } as ServiceInput & { firestoreId: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching service by ID ${id} from DB:`, error);
    return null;
  }
});

export async function createService(data: Omit<ServiceInput, 'id'> & { id: string }) {
  const validation = serviceSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  const { id: serviceId, ...serviceData } = validation.data;

  try {
    const db = await getDb();
    const existingService = await db.collection(SERVICES_COLLECTION).doc(serviceId).get();
    if (existingService.exists) {
      return { success: false, message: "Bu ID (slug) zaten kullanılıyor." };
    }

    await db.collection(SERVICES_COLLECTION).doc(serviceId).set({
      ...serviceData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/manage-services');
    revalidatePath('/hizmetler');
    return { success: true, message: 'Hizmet başarıyla oluşturuldu.', id: serviceId };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateService(id: string, data: Partial<Omit<ServiceInput, 'id'>>) {
   const updateSchema = serviceSchema.omit({ id: true }).partial();
 
   const validation = updateSchema.safeParse(data);
   if (!validation.success) {
     return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
   }
   
   const updateData = validation.data;

  try {
    const db = await getDb();
    const docRef = db.collection(SERVICES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek hizmet bulunamadı." };
    }

    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-services');
    revalidatePath('/hizmetler');
    revalidatePath(`/admin/manage-services/edit/${id}`);
    return { success: true, message: 'Hizmet başarıyla güncellendi.', id: id };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteService(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(SERVICES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek hizmet bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-services');
    revalidatePath('/hizmetler');
    return { success: true, message: 'Hizmet başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
