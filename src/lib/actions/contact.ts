
"use server";

import { z } from "zod";
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from "next/cache";

const contactFormSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır.").max(50, "İsim en fazla 50 karakter olabilir."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır.").max(100, "Konu en fazla 100 karakter olabilir."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır.").max(1000, "Mesaj en fazla 1000 karakter olabilir."),
});

export interface ContactSubmission {
  id?: string; // Firestore document ID
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: admin.firestore.Timestamp | Date | string; // Allow for server timestamp on write, Date/string on read
  isRead: boolean;
}

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

const CONTACT_SUBMISSIONS_COLLECTION = 'contactSubmissions';

export async function submitContactForm(values: z.infer<typeof contactFormSchema>) {
  const validation = contactFormSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: "Form verileri geçersiz.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    await db.collection(CONTACT_SUBMISSIONS_COLLECTION).add({
      ...validation.data,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });
    // Optionally revalidate admin path if messages are displayed there immediately
    // revalidatePath('/admin/contact-messages'); 
    return { success: true, message: "Mesajınız başarıyla alındı! En kısa sürede geri dönüş yapacağız." };
  } catch (error: any) {
    console.error("Error submitting contact form to Firestore:", error);
    return { success: false, message: `Mesajınız gönderilirken bir hata oluştu: ${error.message}` };
  }
}

export const getContactMessages = cache(async (): Promise<Array<ContactSubmission & { id: string }>> => {
  try {
    const db = await getDb();
    const snapshot = await db.collection(CONTACT_SUBMISSIONS_COLLECTION).orderBy('submittedAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for client components
        submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function' 
                     ? (data.submittedAt as admin.firestore.Timestamp).toDate().toISOString() 
                     : new Date().toISOString(), // Fallback or handle as needed
      } as ContactSubmission & { id: string };
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }
});
