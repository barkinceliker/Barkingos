
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

export interface ProjectInput {
  id: string; // User-defined slug-like ID, will be Firestore document ID
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  status: 'Tamamlandı' | 'Devam Ediyor' | 'Planlanıyor';
  technologies: string[];
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  dataAiHint?: string;
}

const projectSchema = z.object({
  id: z.string().min(1, "Proje ID (slug) gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID sadece küçük harf, rakam ve tire içerebilir."),
  title: z.string().min(1, "Başlık gereklidir."),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Kısa açıklama gereklidir."),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Geçerli bir resim URL'si giriniz.").or(z.literal('')),
  status: z.enum(['Tamamlandı', 'Devam Ediyor', 'Planlanıyor'], { message: "Geçerli bir durum seçiniz."}),
  technologies: z.array(z.string()).min(1, "En az bir teknoloji gereklidir."),
  liveDemoUrl: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal('')),
  sourceCodeUrl: z.string().url("Geçerli bir URL giriniz.").optional().or(z.literal('')),
  dataAiHint: z.string().max(50, "AI ipucu en fazla 50 karakter olabilir.").optional(),
});

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

const PROJECTS_COLLECTION = 'projects';

export const getAllProjectsFromDb = cache(async (): Promise<Array<ProjectInput & { firestoreId: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(PROJECTS_COLLECTION).orderBy('title', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    // Firestore'dan gelen document ID'sini `firestoreId` olarak, kullanıcı tanımlı `id`'yi ise kendi alanı olarak saklıyoruz.
    // Ancak burada `id` zaten document ID olduğu için `firestoreId`'ye gerek yok, `id` direkt doc.id olacak.
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProjectInput & { firestoreId: string }));
  } catch (error) {
    console.error("Error fetching all projects from DB:", error);
    return [];
  }
});

export const getProjectByIdFromDb = cache(async (id: string): Promise<(ProjectInput & { firestoreId: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(PROJECTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { ...docSnap.data(), id: docSnap.id } as ProjectInput & { firestoreId: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching project by ID ${id} from DB:`, error);
    return null;
  }
});

export async function createProject(data: ProjectInput) {
  const validation = projectSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  const { id: projectId, ...projectData } = validation.data;

  try {
    const db = await getDb();
    const existingProject = await db.collection(PROJECTS_COLLECTION).doc(projectId).get();
    if (existingProject.exists) {
      return { success: false, message: "Bu ID (slug) zaten kullanılıyor." };
    }

    await db.collection(PROJECTS_COLLECTION).doc(projectId).set({
      ...projectData, // id'yi burada tekrar eklemiyoruz çünkü doc() ile belirttik.
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/manage-projects');
    revalidatePath('/projeler');
    // revalidatePath(`/projeler/${projectId}/detay`); // Eğer detay sayfası varsa
    return { success: true, message: 'Proje başarıyla oluşturuldu.', id: projectId };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
   // `id` alanı güncellenemez, bu yüzden onu şemadan çıkarıp validasyondan sonra tekrar ekleyebiliriz veya partial şemada olmamasını sağlarız.
   const updateSchema = projectSchema.omit({ id: true }).partial();
 
   const validation = updateSchema.safeParse(data);
   if (!validation.success) {
     return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
   }
   
   const updateData = validation.data;

  try {
    const db = await getDb();
    const docRef = db.collection(PROJECTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek proje bulunamadı." };
    }

    // Eğer data içinde id varsa ve orjinal id'den farklıysa bu bir slug/id değiştirme senaryosudur,
    // bu şu an için desteklenmiyor. Sadece içeriği güncelliyoruz.
    // Slug değiştirme istenirse, create'deki gibi eskiyi silip yeniyi oluşturma mantığı eklenebilir.

    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/manage-projects');
    revalidatePath('/projeler');
    // revalidatePath(`/projeler/${id}/detay`);
    return { success: true, message: 'Proje başarıyla güncellendi.', id: id };
  } catch (error: any) {
    console.error("Error updating project:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteProject(id: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(PROJECTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek proje bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-projects');
    revalidatePath('/projeler');
    // revalidatePath(`/projeler/${id}/detay`); 
    return { success: true, message: 'Proje başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

// generateStaticParams için Firestore'dan ID'leri çek (eğer proje detay sayfaları statik generate edilecekse)
export async function getAllProjectIds(): Promise<{ id: string }[]> {
  const projects = await getAllProjectsFromDb(); 
  return projects.map(project => ({ id: project.id }));
}

    