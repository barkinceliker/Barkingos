
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Using relative path from src/middleware.ts to src/lib/firebaseAdmin.ts
import { admin, getAdminInitializationError } from './lib/firebaseAdmin'; 

export const runtime = 'nodejs';

export const config = {
  matcher: ['/admin/:path*'], // Protect admin routes and potential admin API routes
};

export async function middleware(request: NextRequest) {
  console.log(`Middleware (Node.js runtime) executed for path: ${request.nextUrl.pathname}`);

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error("Middleware: Firebase Admin SDK initialization error during middleware execution:", adminInitError);
    // If Admin SDK init failed, auth cannot be checked reliably.
    // Redirect to login with an error, or to a general error page.
    // This prevents access to admin routes if the core auth mechanism is broken.
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'server_init_failed');
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    // It's important not to proceed if adminInitError is set, as auth checks would be unreliable.
    if (request.nextUrl.pathname !== '/admin/login') { // Avoid redirect loop if already on login
        return NextResponse.redirect(loginUrl);
    }
    // If on login page and server init failed, allow to show the login page with potential error messages.
    return NextResponse.next();
  }

  const token = request.cookies.get('adminAuthToken')?.value;

  // Allow access to /admin/login page itself without a token,
  // or if there was an admin init error (handled above for non-login pages).
  if (request.nextUrl.pathname === '/admin/login') {
    console.log("Middleware: Accessing /admin/login, allowing.");
    return NextResponse.next();
  }

  // If not accessing /admin/login and no token, redirect
  if (!token) {
    console.log("Middleware: No auth token found for protected admin route. Redirecting to /admin/login.");
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, try to verify it
  // Check if admin.auth itself is available (it should be if adminInitError is null)
  if (!admin || typeof admin.auth !== 'function') {
    console.error("Middleware: Firebase Admin SDK (admin.auth) not available for token verification, though no init error was reported. This is unexpected. Redirecting to login.");
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'server_config_error_middleware_unexpected');
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    console.log("Middleware: Verifying token with Firebase Admin SDK (admin.auth().verifyIdToken)...");
    await admin.auth().verifyIdToken(token); 
    console.log("Middleware: Token verified successfully for path:", request.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.warn("Middleware: Token verification failed. Redirecting to /admin/login. Error:", (error as Error).message);
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    loginUrl.searchParams.set('error', 'token_invalid_middleware');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('adminAuthToken'); // Clear invalid token from browser
    return response;
  }
}
