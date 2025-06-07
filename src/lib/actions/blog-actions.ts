
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// BlogPost arayüzünü ve diğerlerini blog-data.ts'den alabiliriz veya burada yeniden tanımlayabiliriz.
// Şimdilik blog-data.ts'deki yapıyı temel alalım.
export interface BlogPostInput {
  slug: string;
  title: string;
  date: string; // Firestore Timestamp olarak saklamak daha iyi olabilir, ama string ile başlayalım.
  category: string;
  tags: string[]; // Array of strings
  imageUrl: string;
  summary?: string;
  content: string; // HTML content
  dataAiHint?: string;
}

const blogPostSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir."),
  slug: z.string().min(1, "Slug gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug sadece küçük harf, rakam ve tire içerebilir."),
  date: z.string().min(1, "Tarih gereklidir."), // Belki date picker ile daha iyi olur.
  category: z.string().min(1, "Kategori gereklidir."),
  tags: z.array(z.string()).min(1, "En az bir etiket gereklidir."),
  imageUrl: z.string().url("Geçerli bir resim URL'si giriniz.").or(z.literal('')),
  summary: z.string().optional(),
  content: z.string().min(1, "İçerik gereklidir."),
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

const BLOG_COLLECTION = 'blogPosts';

export const getAllBlogPosts = cache(async (): Promise<Array<BlogPostInput & { id: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(BLOG_COLLECTION).orderBy('date', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPostInput & { id: string }));
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<(BlogPostInput & { id: string }) | null> => {
  try {
    const db = await getDb();
    const docRef = db.collection(BLOG_COLLECTION).doc(slug);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPostInput & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching blog post by slug ${slug}:`, error);
    return null;
  }
});

export async function createBlogPost(data: BlogPostInput) {
  const validation = blogPostSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }

  try {
    const db = await getDb();
    // Slug'ın benzersizliğini kontrol et (isteğe bağlı ama önerilir)
    const existingPost = await db.collection(BLOG_COLLECTION).doc(validation.data.slug).get();
    if (existingPost.exists) {
      return { success: false, message: "Bu slug zaten kullanılıyor." };
    }

    await db.collection(BLOG_COLLECTION).doc(validation.data.slug).set({
      ...validation.data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/manage-blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${validation.data.slug}`);
    return { success: true, message: 'Blog yazısı başarıyla oluşturuldu.', slug: validation.data.slug };
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function updateBlogPost(originalSlug: string, data: Partial<BlogPostInput>) {
   // Gelen veriyi doğrula, sadece slug ve title zorunlu değil, diğerleri partial olabilir.
   // Ancak slug değiştiriliyorsa, yeni slug'ın da geçerli olması lazım.
   const partialSchema = blogPostSchema.partial().extend({
    // Eğer slug güncelleniyorsa, onun da geçerli formatta olması gerekir.
    slug: z.string().min(1, "Slug gereklidir.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug sadece küçük harf, rakam ve tire içerebilir.").optional(),
  });

  const validation = partialSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, message: "Doğrulama hatası." };
  }
  
  const { slug: newSlug, ...updateData } = validation.data;

  try {
    const db = await getDb();
    const docRef = db.collection(BLOG_COLLECTION).doc(originalSlug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Güncellenecek blog yazısı bulunamadı." };
    }

    if (newSlug && newSlug !== originalSlug) {
      // Slug değiştiriliyorsa, yeni slug'ın benzersizliğini kontrol et
      const newSlugDoc = await db.collection(BLOG_COLLECTION).doc(newSlug).get();
      if (newSlugDoc.exists) {
        return { success: false, message: "Yeni slug zaten başka bir yazı tarafından kullanılıyor." };
      }
      // Eski dokümanı sil ve yeni slug ile yeni doküman oluştur (veya Firestore transaction kullan)
      const currentData = docSnap.data();
      await db.collection(BLOG_COLLECTION).doc(newSlug).set({
        ...currentData,
        ...updateData, // slug hariç diğer güncellenen veriler
        slug: newSlug, // yeni slug
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await docRef.delete(); // Eski slug'lı dokümanı sil
      revalidatePath(`/blog/${originalSlug}`); // Eski yolu revalidate et
    } else {
      // Slug değişmiyorsa, sadece güncelle
      await docRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    revalidatePath('/admin/manage-blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${newSlug || originalSlug}`);
    return { success: true, message: 'Blog yazısı başarıyla güncellendi.', slug: newSlug || originalSlug };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

export async function deleteBlogPost(slug: string) {
  try {
    const db = await getDb();
    const docRef = db.collection(BLOG_COLLECTION).doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Silinecek blog yazısı bulunamadı." };
    }

    await docRef.delete();
    revalidatePath('/admin/manage-blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`); // Artık 404 vermeli
    return { success: true, message: 'Blog yazısı başarıyla silindi.' };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, message: `Bir hata oluştu: ${error.message}` };
  }
}

// generateStaticParams için Firestore'dan slug'ları çek
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const posts = await getAllBlogPosts(); // Bu zaten cache'li
  return posts.map(post => ({ slug: post.slug }));
}
