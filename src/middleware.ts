
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAuthStatus } from '@/lib/actions/auth'; // Using alias again, assuming it's generally preferred

// Specify Node.js runtime
export const runtime = 'nodejs';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page itself if you had one, not strictly needed with popover)
     * - '/' (homepage, if you want it unprotected) - uncomment if needed
     * - Public asset paths (e.g., /images/, /resume-placeholder.pdf)
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|login|images|.*\\.png$|.*\\.pdf$).*)', // Example if you want to exclude more
    '/admin/:path*', // Protect all admin routes
  ],
};

export async function middleware(request: NextRequest) {
  console.log(`Middleware: Path: ${request.nextUrl.pathname}`);

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log("Middleware: Checking auth for /admin route.");
    try {
      const { isAuthenticated } = await checkAuthStatus();
      console.log(`Middleware: isAuthenticated: ${isAuthenticated}`);

      if (!isAuthenticated) {
        console.log("Middleware: Not authenticated, redirecting to homepage.");
        // If not authenticated and trying to access an admin route,
        // redirect to the homepage. The login is in the header.
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }
      console.log("Middleware: Authenticated, allowing access to /admin route.");
    } catch (error) {
      console.error("Middleware: Error during auth check:", error);
      // In case of an error during auth check (e.g., Firebase Admin SDK issue),
      // it's safer to redirect to homepage or an error page.
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}
