
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { THEME_OPTIONS, type ThemeName } from '@/lib/theme-config';

// --- Theme Settings ---
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

// --- Site General Settings ---
export interface SiteGeneralSettings {
  siteTitle: string;
  updatedAt?: string;
}

const siteGeneralSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site başlığı gereklidir."),
});

const DEFAULT_SITE_GENERAL_SETTINGS: SiteGeneralSettings = {
  siteTitle: 'BenimSitem',
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
const GENERAL_SETTINGS_DOCUMENT_ID = 'general';


// --- Theme Setting Actions ---
export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  console.log("[settings-actions] getThemeSetting called");
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const parsedTheme = THEME_OPTIONS.includes(data?.activeTheme as ThemeName) ? data?.activeTheme as ThemeName : 'default';
      console.log("[settings-actions] getThemeSetting: Found theme in DB -", parsedTheme);
      return {
        activeTheme: parsedTheme,
        updatedAt: data?.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
      };
    } else {
      console.log("[settings-actions] getThemeSetting: No theme doc, creating default.");
      await docRef.set({
        ...DEFAULT_THEME_SETTING,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error("[settings-actions] Error fetching theme setting:", error);
    return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
  }
});

export async function updateThemeSetting(themeName: ThemeName) {
  console.log(`[settings-actions] updateThemeSetting called with themeName: ${themeName}`);
  const validation = themeSettingSchema.safeParse({ activeTheme: themeName });
  if (!validation.success) {
    console.error("[settings-actions] updateThemeSetting validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, message: "Geçersiz tema adı.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    await docRef.set({
      activeTheme: validation.data.activeTheme,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`[settings-actions] Theme updated in DB to: ${validation.data.activeTheme}. Revalidating paths...`);
    revalidatePath('/', 'layout'); 
    revalidatePath('/admin'); 
    console.log("[settings-actions] Paths revalidated.");
    return { success: true, message: 'Tema başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("[settings-actions] Error updating theme setting:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}


// --- Site General Settings Actions ---
export const getSiteGeneralSettings = cache(async (): Promise<SiteGeneralSettings> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as Partial<SiteGeneralSettings>; 
      return {
        siteTitle: data?.siteTitle || DEFAULT_SITE_GENERAL_SETTINGS.siteTitle,
        updatedAt: (docSnap.data()?.updatedAt as admin.firestore.Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
      };
    } else {
      await docRef.set({
        ...DEFAULT_SITE_GENERAL_SETTINGS,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error("Error fetching site general settings:", error);
    return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: new Date().toISOString() };
  }
});

export async function updateSiteGeneralSettings(data: Partial<Omit<SiteGeneralSettings, 'updatedAt'>>) {
  const { ...restData } = data; 
  const validation = siteGeneralSettingsSchema.partial().safeParse(restData);
  if (!validation.success) {
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    await docRef.set({
      ...validation.data, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    revalidatePath('/', 'layout'); 
    revalidatePath('/admin'); 
    return { success: true, message: 'Genel site ayarları başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("Error updating site general settings:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
