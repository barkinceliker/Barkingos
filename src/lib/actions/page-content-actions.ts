
'use server';

import { z } from 'zod';
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';
import { cache } from 'react';
import { revalidatePath } from 'next/cache';

// About Me Page Interface and Schema
export interface HakkimdaPageContent {
  id?: string; 
  pageTitle: string;
  pageSubtitle: string;
  profileImageUrl: string;
  profileImageAiHint: string;
  whoAmI_p1: string;
  whoAmI_p2: string;
  whoAmI_p3_hobbies: string;
  stat_experience_value: string;
  stat_expertise_value: string;
  stat_teamwork_value: string;
  mission_title: string;
  mission_p1: string;
  updatedAt?: string;
}

const hakkimdaPageContentSchema = z.object({
  pageTitle: z.string().min(1, "Page title is required."),
  pageSubtitle: z.string().min(1, "Page subtitle is required."),
  profileImageUrl: z.string().url("Please enter a valid profile image URL.").or(z.literal('')).optional(),
  profileImageAiHint: z.string().max(50, "AI hint can be at most 50 characters.").optional(),
  whoAmI_p1: z.string().min(1, "Who Am I? first paragraph is required."),
  whoAmI_p2: z.string().optional(),
  whoAmI_p3_hobbies: z.string().optional(),
  stat_experience_value: z.string().min(1, "Experience duration is required."),
  stat_expertise_value: z.string().min(1, "Expertise areas are required."),
  stat_teamwork_value: z.string().min(1, "Teamwork description is required."),
  mission_title: z.string().min(1, "Mission title is required."),
  mission_p1: z.string().min(1, "Mission paragraph is required."),
});

const DEFAULT_HAKKIMDA_CONTENT: Omit<HakkimdaPageContent, 'id' | 'updatedAt'> = {
  pageTitle: 'About Me',
  pageSubtitle: 'Learn more about my story, passions, and professional journey.',
  profileImageUrl: 'https://placehold.co/400x400.png',
  profileImageAiHint: 'professional portrait',
  whoAmI_p1: 'Hello! I am Barkin Celiker. With my passion for technology and design, I am here to develop projects that make a difference in the digital world. With the knowledge and experience I have gained over the years, I aim to offer user-focused and aesthetically pleasing solutions.',
  whoAmI_p2: 'I love solving problems, learning new things, and being part of creative processes. I believe in teamwork and approach every project with positive energy.',
  whoAmI_p3_hobbies: 'In my spare time, I enjoy researching new technologies, photography, and nature walks.',
  stat_experience_value: '5+ Years of Industry Experience',
  stat_expertise_value: 'Web Development, UI/UX Design, Mobile Applications',
  stat_teamwork_value: 'Collaborative and Proficient in Agile Methodologies',
  mission_title: 'My Mission',
  mission_p1: 'To create aesthetic and functional products that simplify people\'s lives using the power of technology. I always aim to add value to my projects by following the latest trends and continuously improving myself.',
};

// Homepage Content Interface and Schema
export interface HomepageContent {
  id?: string; 
  heroTitle: string;
  heroSubtitle: string;
  aboutSnippetTitle: string;
  aboutSnippetDescription: string;
  recentProjectsTitle: string;
  recentBlogPostsTitle: string;
  updatedAt?: string;
}

const homepageContentSchema = z.object({
  heroTitle: z.string().min(1, "Hero title is required."),
  heroSubtitle: z.string().min(1, "Hero subtitle is required."),
  aboutSnippetTitle: z.string().min(1, "'About Me Snippet' section title is required."),
  aboutSnippetDescription: z.string().min(1, "'About Me Snippet' section description is required."),
  recentProjectsTitle: z.string().min(1, "'Recent Projects' section title is required."),
  recentBlogPostsTitle: z.string().min(1, "'Recent Blog Posts' section title is required."),
});

const DEFAULT_HOMEPAGE_CONTENT: Omit<HomepageContent, 'id' | 'updatedAt'> = {
  heroTitle: "Hello, I'm Barkin Celiker",
  heroSubtitle: "I am a passionate developer and designer. I create amazing user experiences with web technologies. Explore my portfolio and learn more about my projects.",
  aboutSnippetTitle: "Briefly About Me",
  aboutSnippetDescription: "I am dedicated to creating innovative solutions and solving complex problems. I focus on continuous learning and self-improvement.",
  recentProjectsTitle: "My Recent Projects",
  recentBlogPostsTitle: "Latest Blog Posts",
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

// About Me Page Functions
export const getHakkimdaContent = cache(async (): Promise<HakkimdaPageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('hakkimda'); // 'hakkimda' is the document ID for About Me
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data();
      const content: HakkimdaPageContent = {
        id: docSnap.id,
        pageTitle: dataFromDb?.pageTitle || DEFAULT_HAKKIMDA_CONTENT.pageTitle,
        pageSubtitle: dataFromDb?.pageSubtitle || DEFAULT_HAKKIMDA_CONTENT.pageSubtitle,
        profileImageUrl: dataFromDb?.profileImageUrl || DEFAULT_HAKKIMDA_CONTENT.profileImageUrl,
        profileImageAiHint: dataFromDb?.profileImageAiHint || DEFAULT_HAKKIMDA_CONTENT.profileImageAiHint,
        whoAmI_p1: dataFromDb?.whoAmI_p1 || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p1,
        whoAmI_p2: dataFromDb?.whoAmI_p2 || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p2,
        whoAmI_p3_hobbies: dataFromDb?.whoAmI_p3_hobbies || DEFAULT_HAKKIMDA_CONTENT.whoAmI_p3_hobbies,
        stat_experience_value: dataFromDb?.stat_experience_value || DEFAULT_HAKKIMDA_CONTENT.stat_experience_value,
        stat_expertise_value: dataFromDb?.stat_expertise_value || DEFAULT_HAKKIMDA_CONTENT.stat_expertise_value,
        stat_teamwork_value: dataFromDb?.stat_teamwork_value || DEFAULT_HAKKIMDA_CONTENT.stat_teamwork_value,
        mission_title: dataFromDb?.mission_title || DEFAULT_HAKKIMDA_CONTENT.mission_title,
        mission_p1: dataFromDb?.mission_p1 || DEFAULT_HAKKIMDA_CONTENT.mission_p1,
        updatedAt: dataFromDb?.updatedAt && typeof dataFromDb.updatedAt.toDate === 'function' 
                   ? (dataFromDb.updatedAt as admin.firestore.Timestamp).toDate().toISOString() 
                   : new Date().toISOString(),
      };
      return content;
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_HAKKIMDA_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      return { 
        ...DEFAULT_HAKKIMDA_CONTENT, 
        id: 'hakkimda', 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating About Me page content:", error);
    return { 
      ...DEFAULT_HAKKIMDA_CONTENT, 
      id: 'hakkimda', 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateHakkimdaContent(data: Omit<HakkimdaPageContent, 'id' | 'updatedAt'>) {
  const validation = hakkimdaPageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Validation error.", errors: validation.error.flatten().fieldErrors };
  }
  const dataToSave = { ...validation.data };
  if (dataToSave.profileImageUrl === '') {
    dataToSave.profileImageUrl = 'https://placehold.co/400x400.png';
  }
  if (dataToSave.profileImageAiHint === '' && dataToSave.profileImageUrl === 'https://placehold.co/400x400.png') {
    dataToSave.profileImageAiHint = 'placeholder image';
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('hakkimda');
    await docRef.set({ 
      ...dataToSave, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/hakkimda'); // Public about me page
    revalidatePath('/admin'); // Admin panel accordion
    return { success: true, message: 'About Me page successfully updated.' };
  } catch (error: any) {
    console.error("Error updating About Me page content:", error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}

// Homepage Functions
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('anasayfa'); // 'anasayfa' is the document ID for Homepage
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const dataFromDb = docSnap.data();
      const content: HomepageContent = {
        id: docSnap.id,
        heroTitle: dataFromDb?.heroTitle || DEFAULT_HOMEPAGE_CONTENT.heroTitle,
        heroSubtitle: dataFromDb?.heroSubtitle || DEFAULT_HOMEPAGE_CONTENT.heroSubtitle,
        aboutSnippetTitle: dataFromDb?.aboutSnippetTitle || DEFAULT_HOMEPAGE_CONTENT.aboutSnippetTitle,
        aboutSnippetDescription: dataFromDb?.aboutSnippetDescription || DEFAULT_HOMEPAGE_CONTENT.aboutSnippetDescription,
        recentProjectsTitle: dataFromDb?.recentProjectsTitle || DEFAULT_HOMEPAGE_CONTENT.recentProjectsTitle,
        recentBlogPostsTitle: dataFromDb?.recentBlogPostsTitle || DEFAULT_HOMEPAGE_CONTENT.recentBlogPostsTitle,
        updatedAt: dataFromDb?.updatedAt && typeof dataFromDb.updatedAt.toDate === 'function' 
                   ? (dataFromDb.updatedAt as admin.firestore.Timestamp).toDate().toISOString() 
                   : new Date().toISOString(),
      };
      return content;
    } else {
      const defaultDataToSave = { 
        ...DEFAULT_HOMEPAGE_CONTENT, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      };
      await docRef.set(defaultDataToSave);
      return { 
        ...DEFAULT_HOMEPAGE_CONTENT, 
        id: 'anasayfa', 
        updatedAt: new Date().toISOString() 
      };
    }
  } catch (error) {
    console.error("Error fetching/creating Homepage content:", error);
    return { 
      ...DEFAULT_HOMEPAGE_CONTENT, 
      id: 'anasayfa', 
      updatedAt: new Date().toISOString() 
    };
  }
});

export async function updateHomepageContent(data: Omit<HomepageContent, 'id' | 'updatedAt'>) {
  const validation = homepageContentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Validation error.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const db = await getDb();
    const docRef = db.collection(SITE_PAGES_COLLECTION).doc('anasayfa');
    await docRef.set({ 
      ...validation.data, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
    
    revalidatePath('/'); // Revalidate homepage
    revalidatePath('/admin'); // Admin panel accordion
    return { success: true, message: 'Homepage content successfully updated.' };
  } catch (error: any) {
    console.error("Error updating Homepage content:", error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}
