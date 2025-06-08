
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import type { LucideIcon } from 'lucide-react';

export interface NavItemInput {
  id?: string; // Firestore document ID
  label: string;
  href: string;
  iconName?: string; // Lucide icon name
  order: number; // For sorting
  target?: '_blank' | '_self'; // Optional: to open in new tab
}

const navItemSchema = z.object({
  label: z.string().min(1, "Etiket gereklidir."),
  href: z.string().min(1, "Bağlantı (href) gereklidir."),
  iconName: z.string().optional(),
  order: z.number().min(0, "Sıra pozitif bir sayı olmalıdır.").default(0),
  target: z.enum(['_blank', '_self']).optional(),
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

const NAV_ITEMS_COLLECTION = 'navigationItems';

export const getAllNavItems = cache(async (): Promise<Array<NavItemInput & { id: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(NAV_ITEMS_COLLECTION).orderBy('order', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavItemInput & { id: string }));
  } catch (error) {
    console.error("Error fetching all navigation items:", error);
    return [];
  }
});

export const getNavItemById = cache(async (id: string): Promise<(NavItemInput & { id: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(NAV_ITEMS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as NavItemInput & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching navigation item by ID ${id}:`, error);
    return null;
  }
});

export async function createNavItem(data: Omit<NavItemInput, 'id'>) {
  const validation = navItemSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  try {
    const db = await getDb();
    const docRef = await db.collection(NAV_ITEMS_COLLECTION).add({
      ...validation.data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin'); // Main admin page where the list is
    revalidatePath('/', 'layout'); // Revalidate layout as header might change
    return { success: true, message: 'Navigasyon öğesi başarıyla oluşturuldu.', id: docRef.id };
  } catch (error: any) {
    console.error("Error creating navigation item:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateNavItem(id: string, data: Partial<Omit<NavItemInput, 'id'>>) {
   const partialSchema = navItemSchema.partial();
   const validation = partialSchema.safeParse(data);
   if (!validation.success) {
     return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
   }

  try {
    const db = await getDb();
    const docRef = db.collection(NAV_ITEMS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek navigasyon öğesi bulunamadı." };
    }

    await docRef.update({
      ...validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Navigasyon öğesi başarıyla güncellendi.', id };
  } catch (error: any) {
    console.error("Error updating navigation item:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteNavItem(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(NAV_ITEMS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek navigasyon öğesi bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Navigasyon öğesi başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting navigation item:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
