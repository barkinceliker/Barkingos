
"use server";

import { cookies } from 'next/headers';
import { admin } from '@/lib/firebaseAdmin'; 
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token.");
  if (!admin.apps.length || !admin.app()) {
    console.error("AuthActions: Firebase Admin SDK not initialized. Cannot create session. Ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables are correctly set.");
    return { success: false, error: "Sunucu yapılandırma hatası: Firebase Admin SDK başlatılamadı. Lütfen Firebase Admin SDK için gerekli ortam değişkenlerinin (.env dosyasında) doğru ayarlandığından emin olun." };
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken && decodedToken.uid) {
      cookies().set(COOKIE_NAME, idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
      console.log(`AuthActions: Session cookie '${COOKIE_NAME}' set for UID: ${decodedToken.uid}`);
      return { success: true };
    }
    console.warn("AuthActions: ID token verification failed or UID missing.");
    return { success: false, error: "Geçersiz token." };
  } catch (error) {
    console.error("AuthActions: Error verifying ID token or setting cookie:", error);
    return { success: false, error: "Token doğrulama hatası." };
  }
}

export async function logout() {
  console.log("AuthActions: logout called.");
  try {
    cookies().delete(COOKIE_NAME);
    console.log(`AuthActions: Session cookie '${COOKIE_NAME}' deleted.`);
  } catch (error) {
    console.error("AuthActions: Error deleting cookie during logout:", error);
  }
}

export async function checkAuthStatus() {
  console.log("AuthActions: checkAuthStatus called.");
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    console.log("AuthActions: No auth token cookie found.");
    return { isAuthenticated: false };
  }

  if (!admin.apps.length || !admin.app()) {
    console.warn("AuthActions: Firebase Admin SDK not initialized during checkAuthStatus. Assuming token is invalid. Ensure Firebase Admin environment variables are set.");
    return { isAuthenticated: false };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
       console.log(`AuthActions: Auth token cookie is valid for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("AuthActions: Auth token cookie found but verification failed or UID missing.");
    return { isAuthenticated: false };
  } catch (error) {
    console.warn("AuthActions: Error verifying auth token cookie during checkAuthStatus. Invalidating session.", (error as Error).message);
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}
