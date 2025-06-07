
"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Min 1 for simplicity, adjust as needed
});

// Mock admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";
const AUTH_COOKIE_NAME = "adminAuthToken";

export async function login(credentials: z.infer<typeof loginSchema>) {
  try {
    const parsedCredentials = loginSchema.safeParse(credentials);
    if (!parsedCredentials.success) {
      return { success: false, error: "Geçersiz giriş bilgileri." };
    }

    const { email, password } = parsedCredentials.data;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set a simple auth token cookie
      // In a real app, this would be a secure, HttpOnly session token
      const tokenValue = Buffer.from(`${email}:${Date.now()}`).toString('base64'); // Simple pseudo-token
      cookies().set(AUTH_COOKIE_NAME, tokenValue, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        // Secure: process.env.NODE_ENV === 'production', // Enable in production over HTTPS
        // httpOnly: true, // Recommended for security, but makes client-side checks harder
        sameSite: "lax",
      });
      return { success: true };
    } else {
      return { success: false, error: "E-posta veya şifre hatalı." };
    }
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, error: "Sunucu hatası oluştu." };
  }
}

export async function logout() {
  cookies().delete(AUTH_COOKIE_NAME);
  redirect("/admin/login"); // Redirect to login page after logout
}

export async function checkAuthStatus() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return { isAuthenticated: !!token?.value };
}
