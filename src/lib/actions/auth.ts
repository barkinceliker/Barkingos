
"use server";

import { cookies } from 'next/headers';
// Using relative path for the stub to ensure it's picked up
import { admin, getAdminInitializationError } from '../firebaseAdmin'; 
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token (first 20 chars):", idToken ? idToken.substring(0,20) + "..." : "ID token is undefined or empty");
  
  const adminInitError = getAdminInitializationError(); // Will be null from stub
  if (adminInitError) {
    // Should not happen with stub
    const adminInitErrorMsg = `Sunucu yapılandırma hatası (stub issue): ${adminInitError}`;
    console.error("AuthActions Critical Error (Stub Unexpected):", adminInitErrorMsg);
    return { success: false, error: adminInitErrorMsg };
  }

  if (!admin || typeof admin.auth !== 'function') {
    const adminStructureErrorMsg = "Sunucu yapılandırma hatası: Firebase Admin SDK (STUB) beklenen yapıda değil.";
    console.error("AuthActions Critical Error: Firebase Admin SDK STUB not as expected.");
    return { success: false, error: adminStructureErrorMsg };
  }
  console.log("AuthActions: Using STUBBED admin.auth() - token verification will be bypassed by the stub.");

  try {
    // The stub's verifyIdToken will simulate success if an idToken is provided
    console.log("AuthActions: Attempting to 'verify' ID token with STUBBED admin.auth().verifyIdToken()...");
    const decodedToken = await admin.auth().verifyIdToken(idToken); // Stub will pass if token exists
    console.log("AuthActions: STUBBED verifyIdToken call completed.");

    if (decodedToken && decodedToken.uid) {
      cookies().set(COOKIE_NAME, idToken, { // Still store the original token for potential future use
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
      console.log(`AuthActions: Session cookie '${COOKIE_NAME}' set for STUBBED UID: ${decodedToken.uid}. Verification was bypassed (stub in use).`);
      return { success: true };
    }
    // This case implies the stub logic for verifyIdToken failed (e.g. no token provided to stub)
    console.warn("AuthActions: STUBBED ID token verification failed (stub likely received no token or returned no UID):", decodedToken);
    return { success: false, error: "Token (stub) doğrulaması başarısız oldu veya kullanıcı kimliği bulunamadı." };
  } catch (error: any) {
    console.error("AuthActions: Error during STUBBED verifyIdToken or setting cookie:", error);
    let errorMessage = "Token doğrulama hatası (stub).";
     if (error.message && error.message.includes("Stub: No token provided")) {
      errorMessage = "Giriş için token sağlanmadı (stub).";
    } else if (error.message && error.message.includes("Stub: Token present, simulating success")) {
      // This shouldn't be an error path if it simulated success
      errorMessage = "Beklenmedik stub davranışı: Token mevcut, başarı simüle edildi ancak hata oluştu.";
    }
     else if (error.message) {
      errorMessage = `Token doğrulama hatası (stub): ${error.message}`;
    }
    console.error("AuthActions: Specific stub error message:", error.message);
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
  console.log("AuthActions: checkAuthStatus called (using STUBBED admin).");
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    console.log("AuthActions: No auth token cookie found.");
    return { isAuthenticated: false };
  }

  const adminInitError = getAdminInitializationError(); // Will be null from stub
  if (adminInitError) {
    console.warn("AuthActions Warning (Stub Unexpected): Firebase Admin SDK reported an initialization error during checkAuthStatus:", adminInitError);
    return { isAuthenticated: false };
  }

  if (!admin || typeof admin.auth !== 'function') {
    console.warn("AuthActions Warning: Firebase Admin SDK (STUB) not as expected during checkAuthStatus.");
    return { isAuthenticated: false };
  }

  try {
    // The stub's verifyIdToken will simulate success if a token is provided
    const decodedToken = await admin.auth().verifyIdToken(token); // Stub will pass if token exists
    if (decodedToken && decodedToken.uid) {
       console.log(`AuthActions: STUBBED Auth token cookie is 'valid' (bypassed verification, stub in use) for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("AuthActions: STUBBED Auth token cookie found but 'verification' failed (unexpected stub behavior - no UID). Invalidating session.");
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  } catch (error: any) {
    console.warn("AuthActions: Error during STUBBED auth token check during checkAuthStatus:", (error as Error).message);
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}
