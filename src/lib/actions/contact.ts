
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
    console.error("[ContactAction getDb] Admin SDK initialization error:", adminInitError);
    throw new Error(`Sunucu yapılandırma hatası (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    console.error("[ContactAction getDb] Firebase Admin SDK (admin.firestore) not properly initialized.");
    throw new Error("Firebase Admin SDK (admin.firestore) düzgün başlatılamadı.");
  }
  return admin.firestore();
}

const CONTACT_SUBMISSIONS_COLLECTION = 'contactSubmissions';

export async function submitContactForm(values: z.infer<typeof contactFormSchema>) {
  console.log("[ContactAction] submitContactForm called with values:", JSON.stringify(values));
  const validation = contactFormSchema.safeParse(values);
  if (!validation.success) {
    console.error("[ContactAction] Validation failed:", JSON.stringify(validation.error.flatten().fieldErrors));
    return { success: false, message: "Form verileri geçersiz.", errors: validation.error.flatten().fieldErrors };
  }

  console.log("[ContactAction] Validation successful. Data to save:", JSON.stringify(validation.data));

  try {
    const db = await getDb();
    console.log("[ContactAction] Firestore DB instance obtained.");

    const docRef = await db.collection(CONTACT_SUBMISSIONS_COLLECTION).add({
      ...validation.data,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });
    console.log(`[ContactAction] Document successfully added to Firestore with ID: ${docRef.id}`);
    
    // Revalidate paths to update the admin panel display
    // Since contact messages are now in an accordion on the main admin page
    revalidatePath('/admin'); 
    // If you had a separate page for contact messages, you'd revalidate it too:
    // revalidatePath('/admin/contact-messages'); 


    return { success: true, message: "Mesajınız başarıyla alındı! En kısa sürede geri dönüş yapacağız." };
  } catch (error: any) {
    console.error("[ContactAction] Error submitting contact form to Firestore. Message:", error.message, "Stack:", error.stack, "Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
        submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function' 
                     ? (data.submittedAt as admin.firestore.Timestamp).toDate().toISOString() 
                     : new Date().toISOString(), 
      } as ContactSubmission & { id: string };
    });
  } catch (error) {
    console.error("[ContactAction] Error fetching contact messages:", error);
    return [];
  }
});
