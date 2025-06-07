
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { admin } from '@/lib/firebaseAdmin'; // Import admin from the updated firebaseAdmin.ts

export const runtime = 'nodejs'; // Specify Node.js runtime

const COOKIE_NAME = 'adminAuthToken';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Executing for path: ${pathname}.`);

  let firebaseAdminAvailable = false;
  if (admin && typeof admin.initializeApp === 'function' && admin.apps) {
    if (admin.apps.length > 0) {
      console.log("Middleware: Firebase Admin SDK appears to be initialized (admin.apps.length > 0).");
      firebaseAdminAvailable = true;
    } else {
      console.warn("Middleware: Firebase Admin SDK 'admin' object loaded, but no apps are initialized (admin.apps.length is 0). This is likely due to issues in firebaseAdmin.ts, possibly .env configuration or server restart needed.");
    }
  } else {
    console.error("Middleware: CRITICAL - Firebase Admin SDK 'admin' object from '@/lib/firebaseAdmin' is not available or malformed. Middleware cannot perform authentication checks.");
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  const token = cookie?.value;
  let isAuthenticated = false;

  if (token && firebaseAdminAvailable) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken && decodedToken.uid) {
        isAuthenticated = true;
        console.log(`Middleware: Token is valid for UID: ${decodedToken.uid}. User is authenticated.`);
      } else {
        console.log("Middleware: Token found but was invalid upon verification (no UID or verification failed).");
      }
    } catch (error) {
      console.warn("Middleware: Error verifying token with Admin SDK. Invalidating session.", (error as Error).message);
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  } else if (token && !firebaseAdminAvailable) {
    console.warn(`Middleware: Token '${COOKIE_NAME}' found, but Firebase Admin SDK is not available/initialized. Cannot verify token. Treating as unauthenticated.`);
  } else if (!token) {
    console.log(`Middleware: Auth cookie '${COOKIE_NAME}' does NOT exist.`);
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login'; // This page is now deprecated

  if (isAdminRoute && !isAdminLoginPage) {
    if (!isAuthenticated) {
      console.log("Middleware: User is not authenticated for admin route. Redirecting to homepage.");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    console.log("Middleware: User is authenticated. Allowing access to admin route:", pathname);
  }
  
  if (isAuthenticated && isAdminLoginPage) {
      console.log("Middleware: Authenticated user trying to access deprecated login page. Redirecting to /admin.");
      return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
