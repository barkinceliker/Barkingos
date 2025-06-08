
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { CORE_THEME_VARIABLES, type CustomThemeValues as CustomThemeFormValuesType } from '@/lib/custom-theme-variables';

// Firestore'da saklanacak tema yapısı
export interface CustomTheme extends Record<string, string | admin.firestore.Timestamp | undefined> {
  id?: string; // Firestore document ID
  name: string; // Benzersiz ve slug benzeri bir isim (kullanıcı tanımlı)
  displayName: string; // Kullanıcı arayüzünde gösterilecek isim
  // CSS değişkenleri burada dinamik olarak eklenecek
  // Örnek: '--background': '220 17% 95%'
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

// Zod şeması oluşturma
const variableSchemaEntries = CORE_THEME_VARIABLES.reduce((acc, variable) => {
  acc[variable.name] = z.string().min(1, `${variable.label} gereklidir.`);
  return acc;
}, {} as Record<string, z.ZodString>);

const customThemeSchemaBase = z.object({
  name: z.string().min(1, "Tema ID (kısa ad) gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Tema ID sadece küçük harf, rakam ve tire içerebilir ve boşluksuz olmalıdır."),
  displayName: z.string().min(1, "Tema Görünen Adı gereklidir."),
  ...variableSchemaEntries,
});

// Bu tip, formdan gelen ve tüm CSS değişkenlerini içeren tiptir.
// CustomTheme Firestore'a yazılacak, bu yüzden orada string index signature var.
// Formdan gelen veri ise daha katı.
export type CustomThemeInput = z.infer<typeof customThemeSchemaBase>;


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

const CUSTOM_THEMES_COLLECTION = 'customThemes';

export const getAllCustomThemes = cache(async (): Promise<Array<CustomTheme & { id: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(CUSTOM_THEMES_COLLECTION).orderBy('displayName', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CustomTheme & { id: string }));
  } catch (error) {
    console.error("Error fetching all custom themes:", error);
    return [];
  }
});

export const getCustomThemeById = cache(async (id: string): Promise<(CustomTheme & { id: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { ...docSnap.data(), id: docSnap.id } as CustomTheme & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching custom theme by ID ${id}:`, error);
    return null;
  }
});

// Tema adının (slug) benzersizliğini kontrol et
async function isThemeNameUnique(name: string, excludeId?: string): Promise<boolean> {
  const db = await getDb();
  let query = db.collection(CUSTOM_THEMES_COLLECTION).where('name', '==', name);
  const snapshot = await query.get();
  if (snapshot.empty) {
    return true;
  }
  // Eğer excludeId verilmişse (yani güncelleme yapılıyorsa), bulunan dokümanın ID'si hariç tutulmalı
  if (excludeId) {
    return snapshot.docs.every(doc => doc.id === excludeId);
  }
  return false;
}


export async function createCustomTheme(data: CustomThemeInput) {
  const validation = customThemeSchemaBase.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }
  
  const { name, displayName, ...variables } = validation.data;

  if (!await isThemeNameUnique(name)) {
    return { success: false, message: "Bu Tema ID (kısa ad) zaten kullanılıyor.", errors: { name: ["Bu Tema ID zaten kullanılıyor."] }};
  }

  try {
    const db = await getDb();
    
    const themeToSave: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      displayName,
      ...variables // Tüm CSS değişkenlerini doğrudan ekle
    };

    const docRef = await db.collection(CUSTOM_THEMES_COLLECTION).add({
      ...themeToSave,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-settings/custom-themes');
    revalidatePath('/admin/manage-settings/theme'); // Tema seçim sayfasını da yenile
    // Canlı siteyi de etkileyeceği için layout'u revalidate etmek gerekebilir, 
    // ama bu, Bölüm 2'de tema uygulama mantığı eklendikten sonra daha anlamlı olur.
    // revalidatePath('/', 'layout'); 
    return { success: true, message: 'Özel tema başarıyla oluşturuldu.', id: docRef.id };
  } catch (error: any) {
    console.error("Error creating custom theme:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateCustomTheme(id: string, data: Partial<CustomThemeInput>) {
  // Partial update için şemanın partial halini kullan
  const partialValidation = customThemeSchemaBase.partial().safeParse(data);
  if (!partialValidation.success) {
    return { success: false, errors: partialValidation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  const { name, displayName, ...variables } = partialValidation.data;
  
  if (name && !await isThemeNameUnique(name, id)) {
     return { success: false, message: "Bu Tema ID (kısa ad) zaten başka bir tema tarafından kullanılıyor.", errors: { name: ["Bu Tema ID zaten kullanılıyor."] }};
  }

  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek özel tema bulunamadı." };
    }

    const updatePayload: Partial<CustomTheme> = {};
    if (name) updatePayload.name = name;
    if (displayName) updatePayload.displayName = displayName;
    if (Object.keys(variables).length > 0) {
        for (const key in variables) {
            if (Object.prototype.hasOwnProperty.call(variables, key)) {
                // Zod şeması zaten tüm değişkenlerin string olmasını bekliyor.
                updatePayload[key] = variables[key as keyof typeof variables] as string;
            }
        }
    }
    
    if (Object.keys(updatePayload).length === 0) {
        return { success: true, message: "Güncellenecek bir değişiklik bulunamadı.", id };
    }


    await docRef.update({
      ...updatePayload,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-settings/custom-themes');
    revalidatePath(`/admin/manage-settings/custom-themes/edit/${id}`);
    revalidatePath('/admin/manage-settings/theme');
    // revalidatePath('/', 'layout'); // Bölüm 2'de
    return { success: true, message: 'Özel tema başarıyla güncellendi.', id };
  } catch (error: any) {
    console.error("Error updating custom theme:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteCustomTheme(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(CUSTOM_THEMES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek özel tema bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-settings/custom-themes');
    revalidatePath('/admin/manage-settings/theme');
    // revalidatePath('/', 'layout'); // Bölüm 2'de
    return { success: true, message: 'Özel tema başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting custom theme:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}
