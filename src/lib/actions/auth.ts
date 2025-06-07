
"use server";

import { cookies } from 'next/headers';
import { admin } from '@/lib/firebaseAdmin'; 
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token (first 20 chars):", idToken.substring(0,20) + "...");
  if (!admin.apps.length || !admin.app()) {
    console.error("AuthActions Critical Error: Firebase Admin SDK not initialized. Cannot create session.");
    console.error("AuthActions: This usually means the environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) are missing, incorrect in .env, or the server was not restarted after .env changes.");
    console.error("AuthActions: Check server logs for 'FirebaseAdmin: ...' messages from firebaseAdmin.ts for more details on what it sees.");
    return { success: false, error: "Sunucu yapılandırma hatası: Firebase Admin SDK başlatılamadı. Lütfen .env dosyasındaki Firebase Admin SDK için gerekli ortam değişkenlerinin (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) doğru ayarlandığından ve sunucunun yeniden başlatıldığından emin olun. Özel anahtar formatına dikkat edin (tırnak içinde ve \\n karakterleri \\\\n olmalı)." };
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
    console.warn("AuthActions Warning: Firebase Admin SDK not initialized during checkAuthStatus. Assuming token is invalid.");
    console.warn("AuthActions: Check .env variables and server restart. See logs from firebaseAdmin.ts.");
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

