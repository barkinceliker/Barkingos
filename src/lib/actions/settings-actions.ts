
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
    console.error(`[settings-actions getDb] Admin SDK initialization check failed: ${adminInitError}`);
    throw new Error(`Sunucu yapılandırma hatası (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    console.error("[settings-actions getDb] Firebase Admin SDK (admin.firestore) not properly initialized after passing pre-check.");
    throw new Error("Firebase Admin SDK (admin.firestore) düzgün başlatılamadı.");
  }
  return admin.firestore();
}

const SITE_SETTINGS_COLLECTION = 'siteSettings';
const THEME_DOCUMENT_ID = 'theme';
const GENERAL_SETTINGS_DOCUMENT_ID = 'general';


// --- Theme Setting Actions ---
export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  console.log("[settings-actions] getThemeSetting CACHEABLE SERVER ACTION called");
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
      console.log("[settings-actions] getThemeSetting: No theme doc in DB, creating default.");
      await docRef.set({
        ...DEFAULT_THEME_SETTING,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error("[settings-actions] Error in getThemeSetting:", error);
    return { ...DEFAULT_THEME_SETTING, updatedAt: new Date().toISOString() };
  }
});

export async function updateThemeSetting(themeName: ThemeName) {
  console.log(`[settings-actions] updateThemeSetting SERVER ACTION called with themeName: ${themeName}`);

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    const errorMessage = `Firebase Admin SDK not initialized properly: ${adminInitError}`;
    console.error(`[settings-actions] updateThemeSetting PRE-CHECK FAILED: ${errorMessage}`);
    return { success: false, message: `Tema güncellenemedi: Sunucu yapılandırma sorunu (${adminInitError}). Lütfen sistem yöneticisi ile iletişime geçin.` };
  }
  console.log("[settings-actions] updateThemeSetting: Admin SDK pre-check passed.");

  const validation = themeSettingSchema.safeParse({ activeTheme: themeName });
  if (!validation.success) {
    const validationErrors = validation.error.flatten().fieldErrors;
    console.error("[settings-actions] updateThemeSetting validation failed:", JSON.stringify(validationErrors));
    return { success: false, message: "Geçersiz tema adı.", errors: validationErrors };
  }
  console.log("[settings-actions] updateThemeSetting: Theme name validation successful.");

  try {
    const db = await getDb(); 
    console.log("[settings-actions] updateThemeSetting: Firestore DB instance obtained.");

    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    console.log(`[settings-actions] updateThemeSetting: Attempting to set theme '${validation.data.activeTheme}' in Firestore document '${SITE_SETTINGS_COLLECTION}/${THEME_DOCUMENT_ID}'.`);

    await docRef.set({
      activeTheme: validation.data.activeTheme,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`[settings-actions] updateThemeSetting: Theme successfully updated in DB to: ${validation.data.activeTheme}.`);

    try {
      console.log("[settings-actions] updateThemeSetting: Attempting to revalidate paths ('/', '/admin')...");
      revalidatePath('/', 'layout'); // Revalidate the entire layout
      revalidatePath('/admin');       // Revalidate admin page if theme affects it
      console.log("[settings-actions] updateThemeSetting: Paths revalidated successfully.");
    } catch (revalidateError: any) {
      console.warn(`[settings-actions] updateThemeSetting: Path revalidation failed but db update was successful. Error: ${revalidateError.message}`, revalidateError);
    }

    return { success: true, message: 'Tema başarıyla güncellendi.' };
  } catch (error: any) {
    let detailedErrorMessage = `Tema güncellenirken bir sunucu hatası oluştu.`;
    if (error.code) { 
        detailedErrorMessage = `Firestore Hatası (Kod: ${error.code}): ${error.message}`;
    } else if (error.message) {
        detailedErrorMessage = error.message; 
    }
    console.error(`[settings-actions] Error in updateThemeSetting Firestore operation: ${detailedErrorMessage}`, JSON.stringify(error, Object.getOwnPropertyNames(error).concat(['cause'])));
    return { success: false, message: `Tema güncellenemedi: ${detailedErrorMessage}` };
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
