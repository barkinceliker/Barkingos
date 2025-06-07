
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic middleware, no longer performing authentication checks.
  console.log(`Middleware: Path: ${request.nextUrl.pathname}. Login checks removed.`);
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
