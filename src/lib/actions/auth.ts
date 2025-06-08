
"use server";

import { cookies } from 'next/headers';
import { admin, getAdminInitializationError } from '../firebaseAdmin'; 

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("[AuthActions createSession] Called with ID token (first 20 chars):", idToken ? idToken.substring(0,20) + "..." : "ID token is undefined or empty");
  
  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    const adminInitErrorMsg = `Server configuration error (Admin SDK): ${adminInitError}`;
    console.error("[AuthActions createSession] Critical Error (Admin SDK Init):", adminInitErrorMsg);
    return { success: false, error: adminInitErrorMsg };
  }

  if (!admin || typeof admin.auth !== 'function') {
    const adminStructureErrorMsg = "Server configuration error: Firebase Admin SDK not as expected (admin.auth function missing).";
    console.error("[AuthActions createSession] Critical Error: Firebase Admin SDK not as expected.", admin);
    return { success: false, error: adminStructureErrorMsg };
  }
  
  try {
    console.log("[AuthActions createSession] Attempting to verify ID token...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("[AuthActions createSession] verifyIdToken call completed.");

    if (decodedToken && decodedToken.uid) {
      cookies().set(COOKIE_NAME, idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
      console.log(`[AuthActions createSession] Session cookie '${COOKIE_NAME}' set for UID: ${decodedToken.uid}. Cookie value (first 20): ${idToken.substring(0,20)}...`);
      return { success: true, uid: decodedToken.uid };
    }
    console.warn("[AuthActions createSession] ID token verification failed or user ID (UID) not found in decoded token:", decodedToken);
    return { success: false, error: "Token verification failed or user ID not found." };
  } catch (error: any) {
    console.error("[AuthActions createSession] Error during verifyIdToken or setting cookie:", error);
    let errorMessage = "Token verification error.";
    if (error.code && error.message) { 
        errorMessage = `Token verification error (createSession): Code ${error.code} - ${error.message}`;
    } else if (error.message) {
        errorMessage = `Token verification error (createSession): ${error.message}`;
    }
    console.error("[AuthActions createSession] Specific error for verifyIdToken:", errorMessage, "Full error object:", error);
    return { success: false, error: errorMessage };
  }
}

export async function logout() {
  console.log("[AuthActions logout] Called.");
  try {
    cookies().delete(COOKIE_NAME);
    console.log(`[AuthActions logout] Session cookie '${COOKIE_NAME}' deleted.`);
    return { success: true };
  } catch (error) {
    console.error("[AuthActions logout] Error deleting cookie during logout:", error);
    return { success: false, error: "Could not delete cookie during logout."};
  }
}

export async function checkAuthStatus() {
  console.log("[AuthActions checkAuthStatus] Called.");
  const cookieStore = await cookies(); 
  const token = cookieStore.get(COOKIE_NAME)?.value;
  console.log(`[AuthActions checkAuthStatus] Cookie token found: ${token ? token.substring(0,20)+'...' : 'null'}`);


  if (!token) {
    console.log("[AuthActions checkAuthStatus] No auth token cookie found.");
    return { isAuthenticated: false };
  }

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.warn("[AuthActions checkAuthStatus] Warning: Firebase Admin SDK reported an initialization error:", adminInitError, ". Assuming not authenticated.");
    return { isAuthenticated: false }; 
  }

  if (!admin || typeof admin.auth !== 'function') {
    console.warn("[AuthActions checkAuthStatus] Warning: Firebase Admin SDK (admin.auth) not as expected. Assuming not authenticated.");
    return { isAuthenticated: false }; 
  }

  try {
    console.time("verifyIdToken"); 
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.timeEnd("verifyIdToken"); 

    if (decodedToken && decodedToken.uid) {
       console.log(`[AuthActions checkAuthStatus] Auth token cookie is valid for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("[AuthActions checkAuthStatus] Auth token cookie found but verification failed (no UID). Invalidating session.");
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  } catch (error: any) {
    console.timeEnd("verifyIdToken"); 
    let detailedErrorMessage = (error as Error).message;
    if (error.code) {
      detailedErrorMessage = `Code: ${error.code}, Message: ${detailedErrorMessage}`;
    }
    console.warn(`[AuthActions checkAuthStatus] Error during auth token check: ${detailedErrorMessage}. Invalidating session. Full error object:`, JSON.stringify(error, Object.getOwnPropertyNames(error).concat(['cause'])));
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}
