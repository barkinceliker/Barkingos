
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { THEME_OPTIONS, type ThemeName, THEME_PALETTES, type ThemePalette } from '@/lib/theme-config';

// --- Theme Settings ---
export interface ThemeSetting {
  activeThemeName: ThemeName;
  activeThemePalette: ThemePalette;
  updatedAt?: string;
}

const themeSettingSchema = z.object({
  activeThemeName: z.enum(THEME_OPTIONS, {
    errorMap: () => ({ message: "Geçersiz tema adı." }),
  }),
  // activeThemePalette is not directly validated from client,
  // it's looked up on the server from THEME_PALETTES based on activeThemeName
});

const DEFAULT_THEME_PALETTE = THEME_PALETTES.default;
const DEFAULT_THEME_SETTING: ThemeSetting = {
  activeThemeName: 'default',
  activeThemePalette: DEFAULT_THEME_PALETTE,
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
const GENERAL_SETTINGS_DOCUMENT_ID = 'general';

const CUSTOM_THEMES_COLLECTION = 'customThemes';
const ACTIVE_THEME_DOCUMENT_ID = 'activeSystemThemeWithPalette'; // New document ID

// --- Theme Setting Actions ---
export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  const logPrefix = "[settings-actions getThemeSetting] SUNUCU EYLEMİ (cache'li):";
  console.log(`${logPrefix} Veritabanından/cache'den tema ayarı ve paleti çekiliyor... YOL: ${CUSTOM_THEMES_COLLECTION}/${ACTIVE_THEME_DOCUMENT_ID}`);
  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(ACTIVE_THEME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const themeNameFromDb = data?.activeThemeName as ThemeName;
      const paletteFromDb = data?.activeThemePalette as ThemePalette | undefined;
      const updatedAt = data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();

      if (THEME_OPTIONS.includes(themeNameFromDb) && paletteFromDb && Object.keys(paletteFromDb).length > 0) {
        console.log(`${logPrefix} VERİTABANINDA BULUNAN TEMA AYARI: Ad='${themeNameFromDb}', Palet mevcut. Güncellenme='${updatedAt}'.`);
        return {
          activeThemeName: themeNameFromDb,
          activeThemePalette: paletteFromDb,
          updatedAt: updatedAt,
        };
      } else if (THEME_OPTIONS.includes(themeNameFromDb)) {
        // Palette DB'de yok ama isim var, THEME_PALETTES'ten bulup döndür
        console.warn(`${logPrefix} VERİTABANINDA '${themeNameFromDb}' için palet eksik. THEME_PALETTES'ten tamamlanıyor.`);
        const foundPalette = THEME_PALETTES[themeNameFromDb];
        if (foundPalette) {
          return { activeThemeName: themeNameFromDb, activeThemePalette: foundPalette, updatedAt };
        }
      }
      // Eğer isim de geçerli değilse veya palet bulunamadıysa varsayılana dön
      console.warn(`${logPrefix} VERİTABANINDA geçerli tema adı veya palet bulunamadı. Varsayılana dönülüyor.`);
    } else {
      console.log(`${logPrefix} VERİTABANINDA '${ACTIVE_THEME_DOCUMENT_ID}' dokümanı bulunamadı. Varsayılan tema ayarı oluşturuluyor ve kaydediliyor.`);
    }
    // Varsayılanı kaydet ve döndür
    const defaultDataToSave: ThemeSetting & { updatedAt: admin.firestore.FieldValue } = {
        activeThemeName: DEFAULT_THEME_SETTING.activeThemeName,
        activeThemePalette: DEFAULT_THEME_SETTING.activeThemePalette,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
    await db.collection(CUSTOM_THEMES_COLLECTION).doc(ACTIVE_THEME_DOCUMENT_ID).set(defaultDataToSave);
    const newUpdatedAt = new Date().toISOString();
    console.log(`${logPrefix} '${ACTIVE_THEME_DOCUMENT_ID}' için varsayılan oluşturuldu. Tema: '${DEFAULT_THEME_SETTING.activeThemeName}', Güncellenme: ${newUpdatedAt}`);
    return { ...DEFAULT_THEME_SETTING, updatedAt: newUpdatedAt };

  } catch (error: any) {
    console.error(`${logPrefix} TEMA ÇEKİLİRKEN HATA:`, error.message, error.stack);
    const errorUpdatedAt = new Date().toISOString();
    console.log(`${logPrefix} Hata nedeniyle varsayılan tema döndürülüyor.`);
    return { ...DEFAULT_THEME_SETTING, updatedAt: errorUpdatedAt };
  }
});

export async function updateThemeSetting(themeName: ThemeName) {
  const logPrefix = "[settings-actions updateThemeSetting] SUNUCU EYLEMİ:";
  console.log(`${logPrefix} BAŞLADI: Tema '${themeName}' olarak güncelleniyor... YOL: ${CUSTOM_THEMES_COLLECTION}/${ACTIVE_THEME_DOCUMENT_ID}`);

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    const errorMessage = `Firebase Admin SDK düzgün başlatılamadı: ${adminInitError}`;
    console.error(`${logPrefix} ÖN KONTROL BAŞARISIZ: ${errorMessage}`);
    return { success: false, message: `Tema güncellenemedi: Sunucu yapılandırma sorunu. Detay: ${adminInitError}` };
  }

  const validation = themeSettingSchema.safeParse({ activeThemeName: themeName });
  if (!validation.success) {
    const validationErrors = validation.error.flatten().fieldErrors;
    const errorMessages = Object.values(validationErrors).flat().join(', ');
    console.error(`${logPrefix} Tema adı doğrulaması BAŞARISIZ:`, JSON.stringify(validationErrors));
    return { success: false, message: `Geçersiz tema adı: ${errorMessages}`, errors: validationErrors };
  }
  console.log(`${logPrefix} Tema adı '${themeName}' doğrulaması başarılı.`);

  const paletteToSave = THEME_PALETTES[themeName];
  if (!paletteToSave) {
    console.error(`${logPrefix} '${themeName}' için THEME_PALETTES içinde palet bulunamadı!`);
    return { success: false, message: `Seçilen tema için palet yapılandırması bulunamadı: ${themeName}` };
  }
  console.log(`${logPrefix} '${themeName}' için palet THEME_PALETTES'ten başarıyla alındı.`);

  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(ACTIVE_THEME_DOCUMENT_ID);
    const dataToSave = {
      activeThemeName: themeName,
      activeThemePalette: paletteToSave,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log(`${logPrefix} Firestore'a YAZILACAK VERİ ('${docRef.path}'): Ad='${dataToSave.activeThemeName}', Palet Anahtarları=${Object.keys(dataToSave.activeThemePalette).join(', ')}`);
    await docRef.set(dataToSave, { merge: true });
    console.log(`${logPrefix} VERİTABANI GÜNCELLEME BAŞARILI: Tema '${themeName}' ve paleti kaydedildi.`);

    try {
      console.log(`${logPrefix} Yollar yeniden doğrulanmaya çalışılıyor: revalidatePath('/', 'layout') ve revalidatePath('/admin')...`);
      revalidatePath('/', 'layout');
      revalidatePath('/admin');
      console.log(`${logPrefix} Yollar başarıyla yeniden doğrulandı.`);
    } catch (revalidateError: any) {
      console.warn(`${logPrefix} UYARI: Yol yeniden doğrulama başarısız oldu ancak veritabanı güncellemesi başarılıydı. Hata: ${revalidateError.message}`, revalidateError.stack);
    }

    return { success: true, message: 'Tema başarıyla güncellendi.' };
  } catch (error: any) {
    let detailedErrorMessage = `Tema güncellenirken bir sunucu hatası oluştu.`;
    if (error.code) {
        detailedErrorMessage = `Firestore Hatası (Kod: ${error.code}): ${error.message}`;
    } else if (error.message) {
        detailedErrorMessage = error.message;
    }
    console.error(`${logPrefix} Firestore İŞLEM HATASI: ${detailedErrorMessage}`, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error).concat(['cause'])));
    return { success: false, message: `Tema güncellenemedi: ${detailedErrorMessage}` };
  }
}


// --- Site General Settings Actions ---
export const getSiteGeneralSettings = cache(async (): Promise<SiteGeneralSettings> => {
  console.log(`[settings-actions getSiteGeneralSettings] SUNUCU EYLEMİ (cache'li): Veritabanından genel site ayarları çekiliyor... YOL: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`);
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
  console.log(`[settings-actions updateSiteGeneralSettings] SUNUCU EYLEMİ BAŞLADI: Genel site ayarları güncelleniyor... YOL: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`, data);
  const { ...restData } = data;
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
    console.log(`[settings-actions updateSiteGeneralSettings] Firestore'a YAZILACAK VERİ ('${docRef.path}'):`, JSON.stringify(dataToSave));
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
