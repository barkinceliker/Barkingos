
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = "adminAuthToken"; // Must match the cookie name in auth.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = request.cookies;
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  console.log(`Middleware: Path: ${pathname}, AuthToken: ${authToken ? 'Exists' : 'Missing'}`);

  if (isAdminRoute) {
    if (isLoginPage) {
      // If user is on login page
      if (authToken) {
        // And already logged in, redirect to admin dashboard
        console.log("Middleware: User on login page but already authenticated. Redirecting to /admin.");
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      // If not logged in, allow access to login page
      console.log("Middleware: Allowing access to /admin/login for unauthenticated user.");
      return NextResponse.next();
    }

    // For any other /admin/* route
    if (!authToken) {
      // If not logged in, redirect to login page
      console.log("Middleware: User not authenticated for admin route. Redirecting to /admin/login.");
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // If logged in, allow access
    console.log("Middleware: User authenticated. Allowing access to admin route:", pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
