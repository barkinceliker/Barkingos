'use server';
/**
 * @fileOverview Navigasyon öğeleri için Firestore CRUD işlemleri.
 *
 * - NavigationItem: Navigasyon öğesi arayüzü.
 * - getAllNavItems: Tüm navigasyon öğelerini getirir.
 * - addNavItem: Yeni navigasyon öğesi ekler.
 * - updateNavItem: Mevcut navigasyon öğesini günceller.
 * - deleteNavItem: Navigasyon öğesini siler.
 * - getNavItemById: Belirli bir navigasyon öğesini ID ile getirir.
 */

import { admin, getAdminInitializationError } from './firebaseAdmin';
import type { Firestore } from 'firebase-admin/firestore';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  iconName?: string; // Lucide icon name (e.g., 'Home', 'User')
  order: number;
  isVisible: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

async function getDb(): Promise<Firestore | null> {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error("NavigationData Critical Error (Admin SDK Init):", adminInitError);
    return null;
  }
  if (!admin || typeof admin.firestore !== 'function') {
    console.error("NavigationData Critical Error: Firebase Admin SDK (admin.firestore) not as expected.");
    return null;
  }
  return admin.firestore();
}

const NAV_COLLECTION = 'navigationItems';

export async function getAllNavItems(options?: { includeHidden?: boolean }): Promise<NavigationItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(NAV_COLLECTION);
    if (!options?.includeHidden) {
      query = query.where('isVisible', '==', true);
    }
    const snapshot = await query.orderBy('order', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NavigationItem));
  } catch (error) {
    console.error("Error fetching navigation items:", error);
    return [];
  }
}

export async function getNavItemById(id: string): Promise<NavigationItem | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const doc = await db.collection(NAV_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as NavigationItem;
  } catch (error) {
    console.error(`Error fetching navigation item with ID ${id}:`, error);
    return null;
  }
}

export async function addNavItem(itemData: Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Veritabanı bağlantısı kurulamadı." };

  try {
    const newItem = {
      ...itemData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection(NAV_COLLECTION).add(newItem);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error adding navigation item:", error);
    return { success: false, error: error.message || "Navigasyon öğesi eklenirken bir hata oluştu." };
  }
}

export async function updateNavItem(id: string, itemData: Partial<Omit<NavigationItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Veritabanı bağlantısı kurulamadı." };

  try {
    const updatedItem = {
      ...itemData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection(NAV_COLLECTION).doc(id).update(updatedItem);
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating navigation item with ID ${id}:`, error);
    return { success: false, error: error.message || "Navigasyon öğesi güncellenirken bir hata oluştu." };
  }
}

export async function deleteNavItem(id: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Veritabanı bağlantısı kurulamadı." };

  try {
    await db.collection(NAV_COLLECTION).doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting navigation item with ID ${id}:`, error);
    return { success: false, error: error.message || "Navigasyon öğesi silinirken bir hata oluştu." };
  }
}
