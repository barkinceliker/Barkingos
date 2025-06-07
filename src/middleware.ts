
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/admin'], // Protects /admin and /admin/* routes
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const idTokenCookie = request.cookies.get('firebaseIdToken');
  const isLoggedIn = !!idTokenCookie?.value;

  // Log all cookies received by the middleware for debugging
  const allCookies = request.cookies.getAll();
  console.log(`Middleware: Path: ${pathname}, All cookies received:`, allCookies.map(c => `${c.name}=${c.value}`).join('; '));
  console.log(`Middleware: Path: ${pathname}, Parsed isLoggedIn from firebaseIdToken: ${isLoggedIn}`);


  // If trying to access the login page
  if (pathname === '/admin/login') {
    if (isLoggedIn) {
      // If already logged in, redirect to the admin dashboard
      console.log("Middleware: User is logged in and trying to access /admin/login. Redirecting to /admin.");
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // If not logged in, allow access to the login page
    console.log("Middleware: Allowing access to /admin/login for non-logged-in user.");
    return NextResponse.next();
  }

  // For any other /admin/* route
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      // If not logged in, redirect to the login page
      console.log("Middleware: User is not logged in. Redirecting to /admin/login.");
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // If logged in, allow access
    console.log("Middleware: User is logged in. Allowing access to", pathname);
  }

  return NextResponse.next();
}
