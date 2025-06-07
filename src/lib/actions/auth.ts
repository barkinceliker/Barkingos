
"use server";

import { cookies } from 'next/headers';
import { admin } from '@/lib/firebaseAdmin'; 
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token (first 20 chars):", idToken ? idToken.substring(0,20) + "..." : "ID token is undefined or empty");
  
  // Robust check for admin app initialization
  if (!admin || !admin.apps || admin.apps.length === 0 || !admin.app()) {
    const adminInitErrorMsg = "Sunucu yapılandırma hatası: Firebase Admin SDK başlatılamamış görünüyor. Lütfen sunucu loglarını kontrol edin.";
    console.error("AuthActions Critical Error: Firebase Admin SDK not initialized or admin object is not as expected. Cannot create session.");
    console.error("AuthActions: Admin object:", admin);
    console.error("AuthActions: Admin apps:", admin ? admin.apps : "admin is undefined");
    console.error("AuthActions: Admin apps length:", admin && admin.apps ? admin.apps.length : "admin or admin.apps is undefined");
    // Log details from firebaseAdmin.ts if available (this assumes getAdminInitializationError is exported, which it is)
    // To avoid circular dependency issues if getAdminInitializationError itself relies on a partially init admin,
    // it might be better to just rely on startup logs of firebaseAdmin.ts.
    // For now, let's assume firebaseAdmin.ts would have logged its own errors.
    return { success: false, error: adminInitErrorMsg };
  }

  try {
    console.log("AuthActions: Attempting to verify ID token with admin.auth().verifyIdToken()...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("AuthActions: verifyIdToken call completed.");

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
    console.warn("AuthActions: ID token verification successful but UID missing in decoded token:", decodedToken);
    return { success: false, error: "Token doğrulandı ancak kullanıcı kimliği bulunamadı." };
  } catch (error: any) {
    console.error("AuthActions: Error verifying ID token or setting cookie:", error);
    let errorMessage = "Token doğrulama hatası.";
    if (error.code === 'auth/id-token-expired') {
      errorMessage = "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.";
    } else if (error.code === 'auth/argument-error') {
      errorMessage = "Token doğrulama argümanları hatalı. ID Token boş veya geçersiz olabilir.";
    } else if (error.message) {
      errorMessage = `Token doğrulama hatası: ${error.message}`;
    }
    console.error("AuthActions: Specific error code:", error.code);
    return { success: false, error: errorMessage };
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
  // No redirect from server action by default, client should handle navigation
}

export async function checkAuthStatus() {
  console.log("AuthActions: checkAuthStatus called.");
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    console.log("AuthActions: No auth token cookie found.");
    return { isAuthenticated: false };
  }

  // Robust check for admin app initialization
  if (!admin || !admin.apps || admin.apps.length === 0 || !admin.app()) {
    console.warn("AuthActions Warning: Firebase Admin SDK not initialized or admin object not as expected during checkAuthStatus. Assuming token is invalid.");
    // Potentially clear the cookie if admin is not initialized, as the token can't be verified
    // cookies().delete(COOKIE_NAME); // Consider this if unverified tokens should always be cleared
    return { isAuthenticated: false };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
       console.log(`AuthActions: Auth token cookie is valid for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("AuthActions: Auth token cookie found but verification failed (no UID after decode). Invalidating session.");
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  } catch (error: any) {
    console.warn("AuthActions: Error verifying auth token cookie during checkAuthStatus. Invalidating session.", (error as Error).message);
    console.warn("AuthActions: Specific error code during checkAuthStatus:", error.code);
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}
