
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedInCookie = request.cookies.get('isLoggedIn');
  const isLoggedIn = isLoggedInCookie?.value === 'true';
  const { pathname } = request.nextUrl;

  // If trying to access admin routes and not logged in, redirect to login
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page but already logged in, redirect to admin
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

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
     * - files in public folder (e.g. images, resume-placeholder.pdf)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/admin/:path*', // Explicitly include admin paths for clarity
    '/login', // Explicitly include login path
  ],
};
