
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// --- Site General Settings ---
export interface SiteGeneralSettings {
  siteTitle: string;
  updatedAt?: string;
}

const siteGeneralSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site başlığı gereklidir."),
});

const DEFAULT_SITE_GENERAL_SETTINGS: SiteGeneralSettings = {
  siteTitle: 'Barkın', // Güncellendi
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
    revalidatePath('/', 'layout'); // Update site title in header
    revalidatePath('/admin'); // Update admin panel if necessary
    console.log(`${logPrefix} Yollar başarıyla yeniden doğrulandı.`);

    return { success: true, message: 'Genel site ayarları başarıyla güncellendi.' };
  } catch (error: any) {
    console.error(`${logPrefix} Genel site ayarları güncellenirken HATA:`, error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
