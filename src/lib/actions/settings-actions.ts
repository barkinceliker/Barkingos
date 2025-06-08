
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
  siteTitle: 'BenimSitem', // Varsayılan site başlığı
};


async function getDb() {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error(`[settings-actions getDb] Admin SDK başlatma hatası: ${adminInitError}`);
    throw new Error(`Sunucu yapılandırma hatası (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    console.error("[settings-actions getDb] Firebase Admin SDK (admin.firestore) düzgün başlatılamadı.");
    throw new Error("Firebase Admin SDK (admin.firestore) düzgün başlatılamadı.");
  }
  return admin.firestore();
}

const SITE_SETTINGS_COLLECTION = 'siteSettings';
const THEME_DOCUMENT_ID = 'theme';
const GENERAL_SETTINGS_DOCUMENT_ID = 'general';


// --- Theme Setting Actions ---
export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  console.log("[settings-actions getThemeSetting] SUNUCU EYLEMİ (cache'li): Veritabanından tema ayarı çekiliyor...");
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const parsedTheme = THEME_OPTIONS.includes(data?.activeTheme as ThemeName) ? data?.activeTheme as ThemeName : 'default';
      const updatedAt = data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();
      console.log(`[settings-actions getThemeSetting] VERİTABANINDA BULUNAN TEMA AYARI: Aktif Tema='${parsedTheme}', Güncellenme='${updatedAt}'. Doküman verisi:`, JSON.stringify(data));
      return {
        activeTheme: parsedTheme,
        updatedAt: updatedAt,
      };
    } else {
      console.log(`[settings-actions getThemeSetting] VERİTABANINDA '${SITE_SETTINGS_COLLECTION}/${THEME_DOCUMENT_ID}' dokümanı bulunamadı. Varsayılan tema ayarı oluşturuluyor: '${DEFAULT_THEME_SETTING.activeTheme}'`);
      const defaultDataToSave = {
        ...DEFAULT_THEME_SETTING,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await docRef.set(defaultDataToSave);
      const newUpdatedAt = new Date().toISOString();
      console.log(`[settings-actions getThemeSetting] '${SITE_SETTINGS_COLLECTION}/${THEME_DOCUMENT_ID}' için varsayılan oluşturuldu. Tema: '${DEFAULT_THEME_SETTING.activeTheme}', Güncellenme: ${newUpdatedAt}`);
      return { ...DEFAULT_THEME_SETTING, updatedAt: newUpdatedAt };
    }
  } catch (error: any) {
    console.error("[settings-actions getThemeSetting] TEMA ÇEKİLİRKEN HATA:", error.message, error.stack);
    const errorUpdatedAt = new Date().toISOString();
    console.log(`[settings-actions getThemeSetting] Hata nedeniyle varsayılan tema döndürülüyor. Tema: '${DEFAULT_THEME_SETTING.activeTheme}', Sahte Güncellenme: ${errorUpdatedAt}`);
    return { ...DEFAULT_THEME_SETTING, updatedAt: errorUpdatedAt };
  }
});

export async function updateThemeSetting(themeName: ThemeName) {
  console.log(`[settings-actions updateThemeSetting] SUNUCU EYLEMİ BAŞLADI: Tema '${themeName}' olarak güncelleniyor...`);

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    const errorMessage = `Firebase Admin SDK düzgün başlatılamadı: ${adminInitError}`;
    console.error(`[settings-actions updateThemeSetting] ÖN KONTROL BAŞARISIZ: ${errorMessage}`);
    return { success: false, message: `Tema güncellenemedi: Sunucu yapılandırma sorunu. Detay: ${adminInitError}` };
  }
  console.log("[settings-actions updateThemeSetting] Admin SDK ön kontrolü başarılı.");

  const validation = themeSettingSchema.safeParse({ activeTheme: themeName });
  if (!validation.success) {
    const validationErrors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.values(validationErrors).flat().join(', ');
    console.error("[settings-actions updateThemeSetting] Tema adı doğrulaması BAŞARISIZ:", JSON.stringify(validationErrors));
    return { success: false, message: `Geçersiz tema adı: ${errorMessages}`, errors: validationErrors };
  }
  console.log("[settings-actions updateThemeSetting] Tema adı doğrulaması başarılı.");

  try {
    const db = await getDb(); 
    console.log("[settings-actions updateThemeSetting] Firestore DB bağlantısı alındı.");

    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(THEME_DOCUMENT_ID);
    const dataToSave = {
      activeTheme: validation.data.activeTheme,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log(`[settings-actions updateThemeSetting] Firestore'a YAZILACAK VERİ ('${SITE_SETTINGS_COLLECTION}/${THEME_DOCUMENT_ID}'):`, JSON.stringify(dataToSave));
    await docRef.set(dataToSave, { merge: true }); 
    const newTimestamp = new Date().toISOString(); // Firestore'dan okumak yerine anlık bir timestamp.
    console.log(`[settings-actions updateThemeSetting] VERİTABANI GÜNCELLEME BAŞARILI: Tema '${validation.data.activeTheme}' olarak ayarlandı. Firestore Timestamp: (sunucu zamanı), Yaklaşık İstemci Zamanı: ${newTimestamp}`);

    try {
      console.log("[settings-actions updateThemeSetting] Yollar yeniden doğrulanmaya çalışılıyor: revalidatePath('/', 'layout') ve revalidatePath('/admin')...");
      revalidatePath('/', 'layout'); 
      revalidatePath('/admin');      
      console.log("[settings-actions updateThemeSetting] Yollar başarıyla yeniden doğrulandı.");
    } catch (revalidateError: any) {
      console.warn(`[settings-actions updateThemeSetting] UYARI: Yol yeniden doğrulama başarısız oldu ancak veritabanı güncellemesi başarılıydı. Hata: ${revalidateError.message}`, revalidateError.stack);
    }

    return { success: true, message: 'Tema başarıyla güncellendi.' };
  } catch (error: any) {
    let detailedErrorMessage = `Tema güncellenirken bir sunucu hatası oluştu.`;
    if (error.code) { 
        detailedErrorMessage = `Firestore Hatası (Kod: ${error.code}): ${error.message}`;
    } else if (error.message) {
        detailedErrorMessage = error.message; 
    }
    console.error(`[settings-actions updateThemeSetting] Firestore İŞLEM HATASI: ${detailedErrorMessage}`, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error).concat(['cause'])));
    return { success: false, message: `Tema güncellenemedi: ${detailedErrorMessage}` };
  }
}


// --- Site General Settings Actions ---
export const getSiteGeneralSettings = cache(async (): Promise<SiteGeneralSettings> => {
  console.log("[settings-actions getSiteGeneralSettings] SUNUCU EYLEMİ (cache'li): Veritabanından genel site ayarları çekiliyor...");
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as Partial<SiteGeneralSettings>;
      const siteTitle = data?.siteTitle || DEFAULT_SITE_GENERAL_SETTINGS.siteTitle;
      const updatedAt = (data?.updatedAt && typeof (data.updatedAt as admin.firestore.Timestamp).toDate === 'function')
                        ? (data.updatedAt as admin.firestore.Timestamp).toDate().toISOString()
                        : new Date().toISOString();
      console.log(`[settings-actions getSiteGeneralSettings] Genel ayarlar bulundu. Başlık: '${siteTitle}', Güncellenme: ${updatedAt}`);
      return {
        siteTitle: siteTitle,
        updatedAt: updatedAt,
      };
    } else {
      console.log(`[settings-actions getSiteGeneralSettings] VERİTABANINDA '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}' dokümanı bulunamadı. Varsayılan genel ayarlar oluşturuluyor...`);
      const defaultDataToSave = {
        ...DEFAULT_SITE_GENERAL_SETTINGS,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await docRef.set(defaultDataToSave);
      const newUpdatedAt = new Date().toISOString();
      console.log(`[settings-actions getSiteGeneralSettings] '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}' için varsayılan oluşturuldu. Başlık: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Güncellenme: ${newUpdatedAt}`);
      return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: newUpdatedAt };
    }
  } catch (error) {
    console.error("[settings-actions getSiteGeneralSettings] Genel site ayarları çekilirken HATA:", error);
    const errorUpdatedAt = new Date().toISOString();
    console.log(`[settings-actions getSiteGeneralSettings] Hata nedeniyle varsayılan genel ayarlar döndürülüyor. Başlık: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Sahte Güncellenme: ${errorUpdatedAt}`);
    return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: errorUpdatedAt };
  }
});

export async function updateSiteGeneralSettings(data: Partial<Omit<SiteGeneralSettings, 'updatedAt'>>) {
  console.log("[settings-actions updateSiteGeneralSettings] SUNUCU EYLEMİ BAŞLADI: Genel site ayarları güncelleniyor...", data);
  const { ...restData } = data; // Ensure no 'updatedAt' is passed from client
  const validation = siteGeneralSettingsSchema.partial().safeParse(restData);
  if (!validation.success) {
    console.error("[settings-actions updateSiteGeneralSettings] Doğrulama BAŞARISIZ:", validation.error.flatten().fieldErrors);
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }
  console.log("[settings-actions updateSiteGeneralSettings] Doğrulama başarılı.");

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    const dataToSave = {
      ...validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    console.log(`[settings-actions updateSiteGeneralSettings] Firestore'a YAZILACAK VERİ ('${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}'):`, JSON.stringify(dataToSave));
    await docRef.set(dataToSave, { merge: true });
    console.log("[settings-actions updateSiteGeneralSettings] VERİTABANI GÜNCELLEME BAŞARILI.");

    console.log("[settings-actions updateSiteGeneralSettings] Yollar yeniden doğrulanmaya çalışılıyor: revalidatePath('/', 'layout') ve revalidatePath('/admin')...");
    revalidatePath('/', 'layout');
    revalidatePath('/admin');
    console.log("[settings-actions updateSiteGeneralSettings] Yollar başarıyla yeniden doğrulandı.");

    return { success: true, message: 'Genel site ayarları başarıyla güncellendi.' };
  } catch (error: any) {
    console.error("[settings-actions updateSiteGeneralSettings] Genel site ayarları güncellenirken HATA:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

    