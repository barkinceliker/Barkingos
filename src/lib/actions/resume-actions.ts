
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// Resume Page Interface and Schema
export interface ResumePageContent {
  id?: string; 
  name: string;
  title: string;
  profileImageUrl: string;
  profileImageAiHint: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  location?: string;
  summary: string; 
  experiencesString: string; 
  educationString: string; 
  skillsString: string; 
  resumePdfUrl: string;
  updatedAt?: string;
}

const resumePageContentSchema = z.object({
  name: z.string().min(1, "Name is required."),
  title: z.string().min(1, "Title is required."),
  profileImageUrl: z.string().url("Please enter a valid profile image URL.").or(z.literal('')).optional(),
  profileImageAiHint: z.string().max(50, "AI hint can be at most 50 characters.").optional(),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
  githubUrl: z.string().url("Please enter a valid GitHub URL.").optional().or(z.literal('')),
  location: z.string().optional(),
  summary: z.string().min(1, "Summary is required."),
  experiencesString: z.string().min(1, "Experiences are required. Separate each experience block with '---'."),
  educationString: z.string().min(1, "Education information is required. Separate each education block with '---'."),
  skillsString: z.string().min(1, "Skills are required (comma-separated)."),
  resumePdfUrl: z.string().url("Please enter a valid PDF URL.").or(z.literal('')).optional(),
});

const DEFAULT_RESUME_CONTENT: Omit<ResumePageContent, 'id' | 'updatedAt'> = {
  name: 'Barkin Celiker', 
  title: 'Senior Software Developer', 
  profileImageUrl: 'https://placehold.co/150x150.png',
  profileImageAiHint: 'professional headshot',
  email: 'mail.barkinclkr@gmail.com', 
  phone: '+90 5XX XXX XX XX', 
  linkedinUrl: 'https://linkedin.com/in/celikerbarkin', 
  githubUrl: 'https://github.com/barkinceliker', 
  location: 'Izmir, Turkey', 
  summary: 'A dedicated professional with 5+ years of experience in software development, focused on creating innovative solutions. Specialized in web technologies, cloud systems, and AI projects.',
  experiencesString: `Role: Senior Software Developer\nCompany: Tech Solutions Inc.\nPeriod: January 2021 - Present\n- Developed scalable web applications.\n- Played a key role in the design and deployment of new features.\n---\nRole: Software Developer\nCompany: Startup X\nPeriod: June 2018 - December 2020\n- Participated in product development processes using Agile methodologies.`,
  educationString: `Degree: B.Sc. in Computer Engineering\nUniversity: Sample University\nPeriod: September 2014 - June 2018`,
  skillsString: 'React, Next.js, TypeScript, Node.js, Python, SQL, Firebase, Google Cloud, Docker, Problem Solving',
  resumePdfUrl: '/barkin_celiker_cv.pdf', 
};

async function getDb() {
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    throw new Error(`Server configuration error (Admin SDK): ${adminInitError}`);
  }
  if (!admin || !admin.firestore) {
    throw new Error("Firebase Admin SDK (admin.firestore) not initialized correctly.");
  }
  return admin.firestore();
}

const SITE_PAGES_COLLECTION = 'sitePages'; 
const RESUME_DOCUMENT_ID = 'resume';

export const getResumeContent = cache(async (): Promise<ResumePageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc(RESUME_DOCUMENT_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data() as Partial<ResumePageContent>; 
      return {
        id: docSnap.id,
        name: dataFromDb.name || DEFAULT_RESUME_CONTENT.name,
        title: dataFromDb.title || DEFAULT_RESUME_CONTENT.title,
        profileImageUrl: dataFromDb.profileImageUrl || DEFAULT_RESUME_CONTENT.profileImageUrl,
        profileImageAiHint: dataFromDb.profileImageAiHint || DEFAULT_RESUME_CONTENT.profileImageAiHint,
        email: dataFromDb.email || DEFAULT_RESUME_CONTENT.email,
        phone: dataFromDb.phone || DEFAULT_RESUME_CONTENT.phone,
        linkedinUrl: dataFromDb.linkedinUrl || DEFAULT_RESUME_CONTENT.linkedinUrl,
        githubUrl: dataFromDb.githubUrl || DEFAULT_RESUME_CONTENT.githubUrl,
        location: dataFromDb.location || DEFAULT_RESUME_CONTENT.location,
        summary: dataFromDb.summary || DEFAULT_RESUME_CONTENT.summary,
        experiencesString: dataFromDb.experiencesString || DEFAULT_RESUME_CONTENT.experiencesString,
        educationString: dataFromDb.educationString || DEFAULT_RESUME_CONTENT.educationString,
        skillsString: dataFromDb.skillsString || DEFAULT_RESUME_CONTENT.skillsString,
        resumePdfUrl: dataFromDb.resumePdfUrl || DEFAULT_RESUME_CONTENT.resumePdfUrl,
        updatedAt: dataFromDb.updatedAt || new Date().toISOString(),
      };
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_RESUME_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      console.log(`Default resume content created in Firestore for document ID: ${RESUME_DOCUMENT_ID}`);
      return { 
        ...DEFAULT_RESUME_CONTENT, 
        id: RESUME_DOCUMENT_ID, 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating Resume page content:", error);
    return { 
      ...DEFAULT_RESUME_CONTENT, 
      id: RESUME_DOCUMENT_ID, 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateResumeContent(data: Omit<ResumePageContent, 'id' | 'updatedAt'>) {
  const validation = resumePageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Validation error.", errors: validation.error.flatten().fieldErrors };
  }
  
  const dataToSave = { ...validation.data };
  if (dataToSave.profileImageUrl === '') {
    dataToSave.profileImageUrl = DEFAULT_RESUME_CONTENT.profileImageUrl;
  }
  if (dataToSave.profileImageAiHint === '' && dataToSave.profileImageUrl === DEFAULT_RESUME_CONTENT.profileImageUrl) {
    dataToSave.profileImageAiHint = DEFAULT_RESUME_CONTENT.profileImageAiHint;
  }
  if (dataToSave.resumePdfUrl === '') {
    dataToSave.resumePdfUrl = DEFAULT_RESUME_CONTENT.resumePdfUrl;
  }


  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc(RESUME_DOCUMENT_ID);
    await docRef.set({ 
      ...dataToSave, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/resume'); 
    revalidatePath('/admin');    
    return { success: true, message: 'Resume successfully updated.' };
  } catch (error: any) {
    console.error("Error updating Resume page content:", error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}
