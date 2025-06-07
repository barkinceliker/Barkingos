
"use server";

import { cookies } from 'next/headers';
// Using relative path from src/lib/actions/auth.ts to src/lib/firebaseAdmin.ts
import { admin, getAdminInitializationError } from '../firebaseAdmin'; 

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token (first 20 chars):", idToken ? idToken.substring(0,20) + "..." : "ID token is undefined or empty");
  
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    const adminInitErrorMsg = `Sunucu yapılandırma hatası (Admin SDK): ${adminInitError}`;
    console.error("AuthActions Critical Error (Admin SDK Init):", adminInitErrorMsg);
    return { success: false, error: adminInitErrorMsg };
  }

  // Check if admin.auth itself is available
  if (!admin || typeof admin.auth !== 'function') {
    const adminStructureErrorMsg = "Sunucu yapılandırma hatası: Firebase Admin SDK beklenen yapıda değil (admin.auth fonksiyonu eksik).";
    console.error("AuthActions Critical Error: Firebase Admin SDK not as expected.", admin);
    return { success: false, error: adminStructureErrorMsg };
  }
  console.log("AuthActions: Using REAL admin.auth() for token verification.");

  try {
    console.log("AuthActions: Attempting to verify ID token with REAL admin.auth().verifyIdToken()...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("AuthActions: REAL verifyIdToken call completed.");

    if (decodedToken && decodedToken.uid) {
      cookies().set(COOKIE_NAME, idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
      console.log(`AuthActions: Session cookie '${COOKIE_NAME}' set for UID: ${decodedToken.uid}.`);
      return { success: true, uid: decodedToken.uid };
    }
    console.warn("AuthActions: ID token verification failed or user ID (UID) not found in decoded token:", decodedToken);
    return { success: false, error: "Token doğrulaması başarısız oldu veya kullanıcı kimliği bulunamadı." };
  } catch (error: any) {
    console.error("AuthActions: Error during verifyIdToken or setting cookie:", error);
    let errorMessage = "Token doğrulama hatası.";
    if (error.code && error.message) { 
        errorMessage = `Token doğrulama hatası: ${error.code} - ${error.message}`;
    } else if (error.message) {
        errorMessage = `Token doğrulama hatası: ${error.message}`;
    }
    console.error("AuthActions: Specific error for verifyIdToken:", errorMessage, "Full error object:", error);
    return { success: false, error: errorMessage };
  }
}

export async function logout() {
  console.log("AuthActions: logout called.");
  try {
    cookies().delete(COOKIE_NAME);
    console.log(`AuthActions: Session cookie '${COOKIE_NAME}' deleted.`);
    return { success: true };
  } catch (error) {
    console.error("AuthActions: Error deleting cookie during logout:", error);
    return { success: false, error: "Çıkış yapılırken çerez silinemedi."};
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

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.warn("AuthActions Warning (checkAuthStatus): Firebase Admin SDK reported an initialization error:", adminInitError, ". Assuming not authenticated.");
    return { isAuthenticated: false }; // Cannot verify token if SDK is broken
  }

  if (!admin || typeof admin.auth !== 'function') {
    console.warn("AuthActions Warning (checkAuthStatus): Firebase Admin SDK (admin.auth) not as expected. Assuming not authenticated.");
    return { isAuthenticated: false }; // Cannot verify token
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
       console.log(`AuthActions (checkAuthStatus): Auth token cookie is valid for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("AuthActions (checkAuthStatus): Auth token cookie found but verification failed (no UID). Invalidating session.");
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  } catch (error: any) {
    console.warn("AuthActions (checkAuthStatus): Error during auth token check:", (error as Error).message, ". Invalidating session.");
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}
