
"use server";

// Login functionality has been removed.
// The auth related server actions (createSession, logout, checkAuthStatus) are no longer active.

export async function createSession(idToken: string) {
  console.warn("createSession called, but login functionality is removed.");
  return { success: false, error: "Login functionality is disabled." };
}

export async function logout() {
  console.warn("logout called, but login functionality is removed.");
  // In a real scenario with cookies, you might redirect here:
  // import { redirect } from "next/navigation";
  // redirect("/some-public-page"); 
}

export async function checkAuthStatus() {
  console.warn("checkAuthStatus called, but login functionality is removed.");
  return { isAuthenticated: false }; // Always return false as there's no login.
}
