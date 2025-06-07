
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware that allows all requests to pass through.
// Authentication logic has been removed.
export function middleware(request: NextRequest) {
  console.log(`Middleware: Allowing request to ${request.nextUrl.pathname} (login functionality removed)`);
  return NextResponse.next();
}

export const config = {
  // Match all paths to ensure this minimal middleware is invoked,
  // but it won't perform any restrictive actions.
  // If you want middleware to do nothing, you can also make this matcher very specific
  // or an empty array if allowed by your Next.js version to effectively disable it.
  // For now, let it match all to acknowledge its existence.
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
