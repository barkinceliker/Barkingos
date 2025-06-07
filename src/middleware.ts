
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedInCookie = request.cookies.get('isLoggedIn');
  const isLoggedIn = isLoggedInCookie?.value === 'true';

  // Updated cookie logging
  const allCookiesArray = request.cookies.getAll();
  const allCookiesString = allCookiesArray.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log(`Middleware: Path: ${pathname}. isLoggedIn cookie value: ${isLoggedInCookie?.value} (parsed as: ${isLoggedIn})`);
  console.log(`Middleware: All cookies received by middleware for path ${pathname}: [${allCookiesString || 'None'}]`);

  // If trying to access admin routes and not logged in, redirect to login
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    console.log("Middleware: Access to admin denied. Redirecting to /login.");
    const loginUrl = new URL('/login', request.url);
    // To prevent redirect loops if /login itself is protected or causes issues
    if (pathname === '/login') return NextResponse.next();
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login page and already logged in, redirect to admin
  if (pathname === '/login' && isLoggedIn) {
    console.log("Middleware: Already logged in. Redirecting from /login to /admin.");
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  console.log(`Middleware: Allowing request to proceed for ${pathname}.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in public folder (e.g. resume-placeholder.pdf)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|resume-placeholder.pdf).*)',
  ],
};
