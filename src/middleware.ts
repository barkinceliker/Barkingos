
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { admin } from '@/lib/firebaseAdmin'; // For potential server-side token verification

const COOKIE_NAME = 'adminAuthToken';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(COOKIE_NAME);
  const token = cookie?.value;
  let isAuthenticated = false;

  // Log all cookies received by the middleware
  let allCookies = "Middleware: All cookies received: ";
  request.cookies.getAll().forEach(c => {
    allCookies += `${c.name}=${c.value}; `;
  });
  console.log(allCookies);
  
  console.log(`Middleware: Path: ${pathname}. Checking for '${COOKIE_NAME}' cookie.`);

  if (token) {
    if (admin.apps.length && admin.app()) {
      try {
        // Verify the token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken && decodedToken.uid) {
          isAuthenticated = true;
          console.log(`Middleware: Token is valid for UID: ${decodedToken.uid}. User is authenticated.`);
        } else {
          console.log("Middleware: Token found but invalid (verification failed or no UID).");
        }
      } catch (error) {
        console.warn("Middleware: Error verifying token with Admin SDK. Invalidating session.", (error as Error).message);
        // Token is invalid (e.g., expired, revoked), clear it
        const response = NextResponse.redirect(new URL('/', request.url)); // Redirect to home
        response.cookies.delete(COOKIE_NAME); // Clear the invalid cookie
        return response;
      }
    } else {
      console.warn("Middleware: Firebase Admin SDK not initialized. Cannot verify token. Assuming unauthenticated.");
      // If Admin SDK is not ready, we cannot confirm authentication.
      // For security, treat as unauthenticated.
    }
  } else {
    console.log(`Middleware: Cookie '${COOKIE_NAME}' does NOT exist.`);
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login'; // This page is now deprecated

  if (isAdminRoute && !isAdminLoginPage) {
    if (!isAuthenticated) {
      console.log("Middleware: User is not authenticated. Redirecting to homepage for admin route access.");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    console.log("Middleware: User is authenticated. Allowing access to admin route:", pathname);
  }
  
  // If user is authenticated and tries to access the (now deprecated) login page, redirect them to admin dashboard
  if (isAuthenticated && isAdminLoginPage) {
      console.log("Middleware: Authenticated user trying to access login page. Redirecting to /admin.");
      return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'], // Apply middleware to all /admin routes
};

    