
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/firebaseAdmin"; // Firebase Admin SDK

const AUTH_COOKIE_NAME = "adminAuthToken";

export async function createSession(idToken: string) {
  if (!admin.apps.length || !admin.app()) {
    console.error("createSession: Firebase Admin SDK not initialized. Cannot verify token.");
    // This typically means environment variables for Firebase Admin are not set.
    return { success: false, error: "Sunucu yapılandırma hatası. Admin SDK başlatılamadı." };
  }
  try {
    // Verify the ID token using Firebase Admin SDK.
    // This checks if the token is valid and not revoked.
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Create a session value (e.g., based on UID and timestamp or use the ID token itself if preferred, though it's longer)
    // For simplicity and to avoid overly long cookies, we'll create a simple marker.
    // In a production app, you might store session details in a database linked to this token.
    const sessionValue = Buffer.from(`${uid}:${Date.now()}`).toString('base64');
    
    cookies().set(AUTH_COOKIE_NAME, sessionValue, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
      sameSite: "lax", // Protection against CSRF
    });

    return { success: true };
  } catch (error) {
    console.error("createSession: Error verifying ID token or setting cookie:", error);
    // Provide a generic error to the client
    return { success: false, error: "Oturum oluşturulamadı. Token doğrulama başarısız." };
  }
}

export async function logout() {
  cookies().delete(AUTH_COOKIE_NAME);
  redirect("/admin/login"); // Redirect to login page after logout
}

export async function checkAuthStatus() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  // In a more robust system, you might want to re-validate this token's active status here if it's a long-lived session.
  // For now, presence of the cookie implies an authenticated session.
  return { isAuthenticated: !!token?.value };
}
