
"use server";

import { z } from "zod";
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from "next/cache";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name can be at most 50 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters.").max(100, "Subject can be at most 100 characters."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(1000, "Message can be at most 1000 characters."),
});

export interface ContactSubmission {
  id?: string; 
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: admin.firestore.Timestamp | Date | string; 
  isRead: boolean;
}

async function getDb() {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error("[ContactAction getDb] Admin SDK initialization error:", adminInitError);
    throw new Error(`Server configuration error (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    console.error("[ContactAction getDb] Firebase Admin SDK (admin.firestore) not properly initialized.");
    throw new Error("Firebase Admin SDK (admin.firestore) not initialized correctly.");
  }
  return admin.firestore();
}

const CONTACT_SUBMISSIONS_COLLECTION = 'contactSubmissions';

export async function submitContactForm(values: z.infer<typeof contactFormSchema>) {
  console.log("[ContactAction] submitContactForm called with values:", JSON.stringify(values));
  const validation = contactFormSchema.safeParse(values);
  if (!validation.success) {
    console.error("[ContactAction] Validation failed:", JSON.stringify(validation.error.flatten().fieldErrors));
    return { success: false, message: "Form data is invalid.", errors: validation.error.flatten().fieldErrors };
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
    
    revalidatePath('/admin'); 
    
    return { success: true, message: "Your message has been received successfully! We will get back to you as soon as possible." };
  } catch (error: any) {
    console.error("[ContactAction] Error submitting contact form to Firestore. Message:", error.message, "Stack:", error.stack, "Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { success: false, message: `An error occurred while sending your message: ${error.message}` };
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
