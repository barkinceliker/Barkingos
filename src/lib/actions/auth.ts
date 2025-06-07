
"use server";

import { cookies } from 'next/headers';
import { admin, verifyFirebaseIdToken } from '@/lib/firebaseAdmin'; // Ensure verifyFirebaseIdToken is exported if used separately
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'adminAuthToken';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week in seconds

export async function createSession(idToken: string) {
  console.log("AuthActions: createSession called with ID token.");
  if (!admin.apps.length || !admin.app()) {
    console.error("AuthActions: Firebase Admin SDK not initialized. Cannot create session.");
    return { success: false, error: "Sunucu hatası: Firebase Admin SDK başlatılamadı." };
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken && decodedToken.uid) {
      // Here you could add a check against your Firestore DB if this UID is an admin
      // For now, we assume any valid Firebase user token is sufficient for an "admin" session.
      // Example: const isAdmin = await checkUserRoleInFirestore(decodedToken.uid, 'admin');
      // if (!isAdmin) return { success: false, error: "Yetkisiz kullanıcı." };

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
    // Note: Firebase client-side signOut should also be called from the component.
  } catch (error) {
    console.error("AuthActions: Error deleting cookie during logout:", error);
    // Even if cookie deletion fails, proceed with client logout
  }
  // No redirect from here, client should handle redirect after Firebase signOut
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
    console.warn("AuthActions: Firebase Admin SDK not initialized during checkAuthStatus. Assuming token is invalid.");
    // To be safe, treat as not authenticated if admin sdk is not ready to verify
    return { isAuthenticated: false };
  }

  try {
    // Re-verify the token to ensure it's still valid (e.g., not revoked)
    // This adds overhead but increases security. For lighter checks, just presence might be enough.
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
       console.log(`AuthActions: Auth token cookie is valid for UID: ${decodedToken.uid}.`);
      return { isAuthenticated: true, uid: decodedToken.uid };
    }
    console.log("AuthActions: Auth token cookie found but verification failed or UID missing.");
    return { isAuthenticated: false };
  } catch (error) {
    console.warn("AuthActions: Error verifying auth token cookie during checkAuthStatus. Invalidating session.", error);
    // If token verification fails (e.g. expired, revoked), delete the cookie
    cookies().delete(COOKIE_NAME);
    return { isAuthenticated: false };
  }
}

    