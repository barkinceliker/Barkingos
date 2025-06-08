
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { THEME_OPTIONS, type ThemeName } from '@/lib/theme-config'; // Import from new config file

export interface ThemeSetting {
  activeTheme: ThemeName;
  updatedAt?: string;
}

const themeSettingSchema = z.object({
  activeTheme: z.enum(THEME_OPTIONS, {
    errorMap: () => ({ message: "Geçersiz tema adı." }),
  }),
});

const DEFAULT_THEME_SETTING: ThemeSetting = {
  activeTheme: 'default',
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

const SITE_SETTINGS_COLLECTION = 'siteSettings';
const THEME_DOCUMENT_ID = 'theme';

export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const parsedTheme = THEME_OPTIONS.includes(data?.activeTheme as ThemeName) ? data?.activeTheme as ThemeName : 'default';
      return {
        activeTheme: parsedTheme,
        updatedAt: data?.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      };
    } else {
      await docRef.set({ 
        ...DEFAULT_THEME_SETTING, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      });
      return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error("Error fetching theme setting:", error);
    return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
  }
});

export async function updateThemeSetting(themeName: ThemeName) {
  const validation = themeSettingSchema.safeParse({ activeTheme: themeName });
  if (!validation.success) {
    return { success: false, message: "Geçersiz tema adı.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    await docRef.set({ 
      activeTheme: validation.data.activeTheme, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/', 'layout'); 
    return { success: true, message: 'Tema başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating theme setting:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
