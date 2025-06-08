
'use server';

// Bu dosya, özel tema yönetimi kaldırıldığı için artık aktif olarak kullanılmamaktadır.
// Önceden tanımlanmış temalar globals.css içinde ve tema seçimi settings-actions.ts üzerinden yönetilmektedir.

import { z } from 'zod';
// import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin'; // Kullanılmıyor
// import { cache } from 'react'; // Kullanılmıyor
// import { revalidatePath } from 'next/cache'; // Kullanılmıyor
// import { CORE_THEME_VARIABLES, type CustomThemeValues as CustomThemeFormValuesType } from '@/lib/custom-theme-variables'; // Kullanılmıyor

console.warn("custom-theme-actions.ts dosyası çağrıldı ancak özel tema yönetimi kaldırıldığı için işlevsizdir.");

export interface CustomTheme {} // Boş arayüz
export type CustomThemeInput = {}; // Boş tip

export async function getAllCustomThemes() { 
  console.warn("getAllCustomThemes çağrıldı ancak özel tema yönetimi kaldırıldı. Boş dizi döndürülüyor.");
  return Promise.resolve([]); 
}

export async function getCustomThemeById(id: string) {
  console.warn(`getCustomThemeById(${id}) çağrıldı ancak özel tema yönetimi kaldırıldı. Null döndürülüyor.`);
  return Promise.resolve(null);
}

export async function createCustomTheme(data: CustomThemeInput) {
  console.warn("createCustomTheme çağrıldı ancak özel tema yönetimi kaldırıldı.");
  return Promise.resolve({ success: false, message: "Özel tema oluşturma özelliği kaldırılmıştır." });
}

export async function updateCustomTheme(id: string, data: Partial<CustomThemeInput>) {
  console.warn(`updateCustomTheme(${id}) çağrıldı ancak özel tema yönetimi kaldırıldı.`);
  return Promise.resolve({ success: false, message: "Özel tema güncelleme özelliği kaldırılmıştır." });
}

export async function deleteCustomTheme(id: string) {
  console.warn(`deleteCustomTheme(${id}) çağrıldı ancak özel tema yönetimi kaldırıldı.`);
  return Promise.resolve({ success: false, message: "Özel tema silme özelliği kaldırılmıştır." });
}
