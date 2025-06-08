
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { THEME_OPTIONS, type ThemeName, THEME_PALETTES } from '@/lib/theme-config';

// --- Theme Settings ---
// Artık sadece tema adını saklayacağız. Palet, theme-config.ts'den gelecek.
export interface ThemeSetting {
  activeThemeName: ThemeName;
  updatedAt?: string; // Firestore'dan gelen timestamp
}

const themeSettingSchema = z.object({
  activeThemeName: z.enum(THEME_OPTIONS, {
    errorMap: () => ({ message: "Geçersiz tema adı." }),
  }),
});

const DEFAULT_THEME_SETTING: ThemeSetting = {
  activeThemeName: 'default',
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
const CUSTOM_THEMES_COLLECTION = 'customThemes'; // Bu koleksiyon adı korunuyor
const ACTIVE_THEME_DOCUMENT_ID = 'activeSystemTheme'; // Doküman adı sadece tema adını tutacak şekilde basitleştirildi

// --- Theme Setting Actions ---
export const getThemeSetting = cache(async (): Promise<ThemeSetting> => {
  const logPrefix = "[settings-actions getThemeSetting] SUNUCU EYLEMİ (cache'li):";
  console.log(`${logPrefix} Veritabanından/cache'den tema ayarı çekiliyor... YOL: ${CUSTOM_THEMES_COLLECTION}/${ACTIVE_THEME_DOCUMENT_ID}`);
  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(ACTIVE_THEME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const themeNameFromDb = data?.activeThemeName as ThemeName;
      const updatedAt = data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();

      if (THEME_OPTIONS.includes(themeNameFromDb)) {
        console.log(`${logPrefix} VERİTABANINDA BULUNAN TEMA ADI: '${themeNameFromDb}'. Güncellenme='${updatedAt}'.`);
        return {
          activeThemeName: themeNameFromDb,
          updatedAt: updatedAt,
        };
      }
      console.warn(`${logPrefix} VERİTABANINDA geçerli tema adı bulunamadı ('${themeNameFromDb}'). Varsayılana dönülüyor.`);
    } else {
      console.log(`${logPrefix} VERİTABANINDA '${ACTIVE_THEME_DOCUMENT_ID}' dokümanı bulunamadı. Varsayılan tema ayarı oluşturuluyor ve kaydediliyor.`);
    }
    // Varsayılanı kaydet ve döndür
    const defaultDataToSave: ThemeSetting & { updatedAt: admin.firestore.FieldValue } = {
        activeThemeName: DEFAULT_THEME_SETTING.activeThemeName,
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
  console.log(`${logPrefix} BAŞLADI: Tema adı '${themeName}' olarak güncelleniyor... YOL: ${CUSTOM_THEMES_COLLECTION}/${ACTIVE_THEME_DOCUMENT_ID}`);

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

  // Palet THEME_PALETTES'ten kontrol ediliyor ama veritabanına sadece isim kaydedilecek.
  if (!THEME_PALETTES[themeName]) {
    console.error(`${logPrefix} '${themeName}' için THEME_PALETTES içinde palet bulunamadı! Bu tema adı geçersiz veya yapılandırılmamış.`);
    return { success: false, message: `Seçilen tema için palet yapılandırması bulunamadı: ${themeName}` };
  }
  console.log(`${logPrefix} '${themeName}' için THEME_PALETTES'te palet mevcut.`);

  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(ACTIVE_THEME_DOCUMENT_ID);
    const dataToSave = { // Sadece tema adını ve timestamp'i kaydediyoruz.
      activeThemeName: themeName,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log(`${logPrefix} Firestore'a YAZILACAK VERİ ('${docRef.path}'): Ad='${dataToSave.activeThemeName}'`);
    await docRef.set(dataToSave, { merge: true }); // merge: true ile sadece bu alanları günceller, dokümandaki diğer alanları (varsa) korur.
    console.log(`${logPrefix} VERİTABANI GÜNCELLEME BAŞARILI: Tema adı '${themeName}' olarak kaydedildi.`);

    try {
      console.log(`${logPrefix} Yollar yeniden doğrulanmaya çalışılıyor: revalidatePath('/', 'layout') ve revalidatePath('/admin')...`);
      revalidatePath('/', 'layout'); // RootLayout'u etkiler
      revalidatePath('/admin'); // Admin sayfasındaki tema seçiciyi etkileyebilir
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
  const logPrefix = "[settings-actions getSiteGeneralSettings] SUNUCU EYLEMİ (cache'li):";
  console.log(`${logPrefix} Veritabanından genel site ayarları çekiliyor... YOL: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`);
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
      console.log(`${logPrefix} Genel ayarlar bulundu. Başlık: '${siteTitle}', Güncellenme: ${updatedAt}`);
      return {
        siteTitle: siteTitle,
        updatedAt: updatedAt,
      };
    } else {
      console.log(`${logPrefix} VERİTABANINDA '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}' dokümanı bulunamadı. Varsayılan genel ayarlar oluşturuluyor...`);
      const defaultDataToSave = {
        ...DEFAULT_SITE_GENERAL_SETTINGS,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await docRef.set(defaultDataToSave);
      const newUpdatedAt = new Date().toISOString();
      console.log(`${logPrefix} '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}' için varsayılan oluşturuldu. Başlık: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Güncellenme: ${newUpdatedAt}`);
      return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: newUpdatedAt };
    }
  } catch (error) {
    console.error(`${logPrefix} Genel site ayarları çekilirken HATA:`, error);
    const errorUpdatedAt = new Date().toISOString();
    console.log(`${logPrefix} Hata nedeniyle varsayılan genel ayarlar döndürülüyor. Başlık: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Sahte Güncellenme: ${errorUpdatedAt}`);
    return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: errorUpdatedAt };
  }
});

export async function updateSiteGeneralSettings(data: Partial<Omit<SiteGeneralSettings, 'updatedAt'>>) {
  const logPrefix = "[settings-actions updateSiteGeneralSettings] SUNUCU EYLEMİ:";
  console.log(`${logPrefix} BAŞLADI: Genel site ayarları güncelleniyor... YOL: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`, data);
  const { ...restData } = data;
  const validation = siteGeneralSettingsSchema.partial().safeParse(restData);
  if (!validation.success) {
    console.error(`${logPrefix} Doğrulama BAŞARISIZ:`, validation.error.flatten().fieldErrors);
    return { success: false, message: "Doğrulama hatası.", errors: validation.error.flatten().fieldErrors };
  }
  console.log(`${logPrefix} Doğrulama başarılı.`);

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    const dataToSave = {
      ...validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    console.log(`${logPrefix} Firestore'a YAZILACAK VERİ ('${docRef.path}'):`, JSON.stringify(dataToSave));
    await docRef.set(dataToSave, { merge: true });
    console.log(`${logPrefix} VERİTABANI GÜNCELLEME BAŞARILI.`);

    console.log(`${logPrefix} Yollar yeniden doğrulanmaya çalışılıyor: revalidatePath('/', 'layout') ve revalidatePath('/admin')...`);
    revalidatePath('/', 'layout');
    revalidatePath('/admin');
    console.log(`${logPrefix} Yollar başarıyla yeniden doğrulandı.`);

    return { success: true, message: 'Genel site ayarları başarıyla güncellendi.' };
  } catch (error: any) {
    console.error(`${logPrefix} Genel site ayarları güncellenirken HATA:`, error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

    