
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
  siteTitle: z.string().min(1, "Site title is required."),
});

const DEFAULT_SITE_GENERAL_SETTINGS: SiteGeneralSettings = {
  siteTitle: 'Barkin Celiker', 
};


async function getDb() {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error(`[settings-actions getDb] Admin SDK initialization error: ${adminInitError}`);
    throw new Error(`Server configuration error (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    console.error("[settings-actions getDb] Firebase Admin SDK (admin.firestore) not initialized correctly.");
    throw new Error("Firebase Admin SDK (admin.firestore) not initialized correctly.");
  }
  return admin.firestore();
}

const SITE_SETTINGS_COLLECTION = 'siteSettings';
const GENERAL_SETTINGS_DOCUMENT_ID = 'general';


// --- Site General Settings Actions ---
export const getSiteGeneralSettings = cache(async (): Promise<SiteGeneralSettings> => {
  const logPrefix = "[settings-actions getSiteGeneralSettings] SERVER ACTION (cached):";
  console.log(`${logPrefix} Fetching general site settings from DB... PATH: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`);
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
      console.log(`${logPrefix} General settings found. Title: '${siteTitle}', Updated: ${updatedAt}`);
      return {
        siteTitle: siteTitle,
        updatedAt: updatedAt,
      };
    } else {
      console.log(`${logPrefix} Document '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}' NOT FOUND in DB. Creating default general settings...`);
      const defaultDataToSave = {
        ...DEFAULT_SITE_GENERAL_SETTINGS,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await docRef.set(defaultDataToSave);
      const newUpdatedAt = new Date().toISOString();
      console.log(`${logPrefix} Default created for '${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}'. Title: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Updated: ${newUpdatedAt}`);
      return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: newUpdatedAt };
    }
  } catch (error) {
    console.error(`${logPrefix} ERROR fetching general site settings:`, error);
    const errorUpdatedAt = new Date().toISOString();
    console.log(`${logPrefix} Returning default general settings due to error. Title: '${DEFAULT_SITE_GENERAL_SETTINGS.siteTitle}', Mock Updated: ${errorUpdatedAt}`);
    return { ...DEFAULT_SITE_GENERAL_SETTINGS, updatedAt: errorUpdatedAt };
  }
});

export async function updateSiteGeneralSettings(data: Partial<Omit<SiteGeneralSettings, 'updatedAt'>>) {
  const logPrefix = "[settings-actions updateSiteGeneralSettings] SERVER ACTION:";
  console.log(`${logPrefix} STARTED: Updating general site settings... PATH: ${SITE_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOCUMENT_ID}`, data);
  const { ...restData } = data;
  const validation = siteGeneralSettingsSchema.partial().safeParse(restData);
  if (!validation.success) {
    console.error(`${logPrefix} Validation FAILED:`, validation.error.flatten().fieldErrors);
    return { success: false, message: "Validation error.", errors: validation.error.flatten().fieldErrors };
  }
  console.log(`${logPrefix} Validation successful.`);

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOCUMENT_ID);
    const dataToSave = {
      ...validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    console.log(`${logPrefix} DATA TO WRITE to Firestore ('${docRef.path}'):`, JSON.stringify(dataToSave));
    await docRef.set(dataToSave, { merge: true });
    console.log(`${logPrefix} DATABASE UPDATE SUCCESSFUL.`);

    console.log(`${logPrefix} Attempting to revalidate paths: revalidatePath('/', 'layout') and revalidatePath('/admin')...`);
    revalidatePath('/', 'layout'); 
    revalidatePath('/admin'); 
    console.log(`${logPrefix} Paths revalidated successfully.`);

    return { success: true, message: 'General site settings successfully updated.' };
  } catch (error: any) {
    console.error(`${logPrefix} ERROR updating general site settings:`, error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}
